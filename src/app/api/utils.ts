import z from "zod";
import { db } from "./upload/db";
import { csvRowsTable } from "./upload/schema";
import { and, eq } from "drizzle-orm";

export const DEFAULT_CHUNK_SIZE = 10;

export const chunkRows = <T>(chunkSize: number, data: T[]): T[][] => {
    const chunks: T[][] = [];

    for (let i = 0; i < (data.length / chunkSize); i++) {
        chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return chunks;
}

export const zip = <T, K>(arr1: T[], arr2: K[]) => {
    if (arr1.length !== arr2.length) {
        throw new Error("Both arrays should have the same length");
    }

    return arr1.map((x, i) => [x, arr2[i]] as const);
}

export const maybeTrim = (s: string | undefined | null) => s?.trim() ?? null

export const timeout = (delay: number) => new Promise(r => setTimeout(r, delay));

export const searchParamsSchema = z.object({
    country: z.string().optional().nullable(),
    employee_size: z.union([
        z.literal("1-10"),
        z.literal("11-50"),
        z.literal("51-200"),
        z.literal("201-500"),
        z.literal("501-1 000"),
        z.literal("1 001-5 000"),
        z.literal("5 001-10 000"),
        z.literal("10 000+"),
    ]).optional().nullable(),
    domain: z.string().optional().nullable(),
});

export const getFilteredData = async (params: z.infer<typeof searchParamsSchema>) => {
    return db.select().from(csvRowsTable).where(and(
        params.country ? eq(csvRowsTable.country, params.country) : undefined,
        params.employee_size ? eq(csvRowsTable.employeeSize, params.employee_size) : undefined,
        params.domain ? eq(csvRowsTable.domain, params.domain) : undefined,
    ))
}

