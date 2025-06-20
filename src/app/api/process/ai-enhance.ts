import { CSV_COLUMNS, CsvRow } from "../types";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";

const csvRowToText = (row: CsvRow): string => {
    return `${row.companyNameRaw ?? ''},${row.domainRaw ?? ''},${row.cityRaw ?? ''},${row.countryRaw ?? ''},${row.employeeSizeRaw ?? ''}`
}

export const enhanceAndClean = async (data: CsvRow[]) => {
    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: `
            You are an agent that helps clean up and enhance CSV rows.
            You will be given a CSV file as input and your job is to clean it up and make the formats consistent.

            Do not create extra rows.
            If a part of a row is empty, you can try and figure out what it should be, if you know it, keep it blank if you don't.
            For the Country field, you should use the full english name: EG: US -> United States.
            
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

