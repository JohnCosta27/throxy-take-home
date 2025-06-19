import { eq, InferInsertModel } from "drizzle-orm";
import { db } from "../upload/db";
import { csvRowsTable, csvsTable } from "../upload/schema";
import { NextResponse } from "next/server";
import { parse } from "papaparse";
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";
import { CSV_COLUMNS } from "../upload/route";

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

const csvRowToText = (row: InferInsertModel<typeof csvRowsTable>): string => {
    return `${row.companyNameRaw ?? ''},${row.domainRaw ?? ''},${row.cityRaw ?? ''},${row.countryRaw ?? ''},${row.employeeSizeRaw ?? ''}`
}

const enhanceAndClean = async (data: InferInsertModel<typeof csvRowsTable>[]) => {
    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: `
            You are an agent that helps clean up CSV rows.
            You will be given a CSV file as input and your job is to clean it up and make the formats consistent.

            Do not create extra rows, but do add information for rows which are missing information.
            
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

export async function POST(request: Request) {
    // TODO: this could fail + validation with Zod would be better.
    const { csvId } = await request.json() as ProcessBody;

    await db.update(csvRowsTable).set({ status: 'processing' });

    const csvRows = await db.select().from(csvRowsTable).where(eq(csvRowsTable.csvId, csvId));

    const chunkedRows = chunkRows(DEFAULT_CHUNK_SIZE, csvRows);

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
                    })
                    .where(eq(csvRowsTable.id, originalRow.id))
            })
    )

    return NextResponse.json({ status: "ok. TODO: not sure what to return here" }, { status: 201 });
}
