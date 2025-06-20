import { eq, InferInsertModel } from "drizzle-orm";
import { db } from "../upload/db";
import { csvRowsTable } from "../upload/schema";
import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";
import { CSV_COLUMNS } from "../upload/route";
import { CsvRow } from "../companies/route";

const DEFAULT_CHUNK_SIZE = 10;

const chunkRows = <T>(chunkSize: number, data: T[]): T[][] => {
    const chunks: T[][] = [];

    for (let i = 0; i < (data.length / chunkSize); i++) {
        chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return chunks;
}

const zip = <T, K>(arr1: T[], arr2: K[]) => {
    if (arr1.length !== arr2.length) {
        throw new Error("Both arrays should have the same length");
    }

    return arr1.map((x, i) => [x, arr2[i]] as const);
}

const maybeTrim = (s: string | null) => s?.trim() ?? null

type ProcessingRecord<T> = {
    [K in keyof T]: (field: T[K]) => T[K]
}

/*
 * We can incrementally add fields and processing functions here.
 * For API calls we could make this async so we're free to do anything we'd like here.
 * I will keep it simple, and just do some basic regex + trimming
 */
const processingFields: Partial<ProcessingRecord<CsvRow>> = {
    domainRaw: (domain) => domain?.replaceAll(" ", "") ?? null,
    companyNameRaw: maybeTrim,
    cityRaw: maybeTrim,
    countryRaw: maybeTrim,
}

const process = (row: CsvRow): CsvRow => {
    const copiedRow = structuredClone(row);
    for (const [k, v] of Object.entries(copiedRow)) {
        const processingFn = processingFields[k as keyof typeof processingFields];
        if (processingFn == null || v == null) {
            continue
        }

        /*
         * Typescript always struggles with Object.entries functions
         * It can't figure out what I'm trying to do here.
         * SAFETY: We know that Object.entries will return the correct key-value,
         * And we know `processingFn` is typed such that the right key corresponds to the
         * right function.
         */
        //@ts-ignore
        copiedRow[k] = processingFn(v);
    }

    return copiedRow;
}

const csvRowToText = (row: InferInsertModel<typeof csvRowsTable>): string => {
    return `${row.companyNameRaw ?? ''},${row.domainRaw ?? ''},${row.cityRaw ?? ''},${row.countryRaw ?? ''},${row.employeeSizeRaw ?? ''}`
}

const enhanceAndClean = async (data: InferInsertModel<typeof csvRowsTable>[]) => {
    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: `
            You are an agent that helps clean up and enhance CSV rows.
            You will be given a CSV file as input and your job is to clean it up and make the formats consistent.

            Do not create extra rows.
            If a part of a row is empty, you can try and figure out what it should be, if you know it, keep it blank if you don't.
            
            You must preserve the order of the rows, and must always return the same number of rows as your input.
        `,
        prompt: `${CSV_COLUMNS.join(",")}\n${data.map(csvRowToText).join('\n')}`,
        output: 'array',
        schema: z.object({
            companyName: z.string(),
            domain: z.string().describe("A valid domain name, no spaces. Blank if unknown"),
            city: z.string().optional().describe("Standard city name"),
            country: z.string().describe("Standard country name"),
            employeeSize: z.string().describe("Must fit the format 1‑10, 11‑50, 51‑200, 201‑500, 501‑1 000, 1 001‑5 000, 5 001‑10 000, 10 000+, choose the most appropriate"),
        })
    });

    return object;
}

export type ProcessBody = {
    csvId: string;
}

const timeout = (delay: number) => new Promise(r => setTimeout(r, delay));

export async function POST(request: Request) {
    // TODO: this could fail + validation with Zod would be better.
    const { csvId } = await request.json() as ProcessBody;

    // Simulated delay, so we can see the 'pending' state before the processing state.
    await timeout(2_000);

    await db.update(csvRowsTable).set({ status: 'processing' }).where(eq(csvRowsTable.csvId, csvId));

    const csvRows = await db.select().from(csvRowsTable).where(eq(csvRowsTable.csvId, csvId));
    const preprocessedRows = csvRows.map(process);
    const chunkedRows = chunkRows(DEFAULT_CHUNK_SIZE, preprocessedRows);

    const enhancedRows = (await Promise.all(chunkedRows.map(enhanceAndClean))).flat();

    await Promise.all(
        zip(csvRows, enhancedRows)
            .map(([originalRow, enhancedRow]) => {
                return db.update(csvRowsTable)
                    .set({
                        companyName: enhancedRow.companyName,
                        domain: enhancedRow.domain,
                        city: enhancedRow.city,
                        country: enhancedRow.country,
                        employeeSize: enhancedRow.employeeSize,
                        status: 'processed',
                    })
                    .where(eq(csvRowsTable.id, originalRow.id))
            })
    )

    return NextResponse.json({ status: "ok. TODO: not sure what to return here" }, { status: 201 });
}
