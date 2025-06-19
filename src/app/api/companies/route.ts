import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../upload/db";
import { csvRowsTable } from "../upload/schema";
import { and, eq } from "drizzle-orm";

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

export const objectSearchParamsFromUrl = (params: URLSearchParams) => {
    return {
        country: params.get("country"),
        employee_size: params.get("employee_size"),
        domain: params.get("domain"),
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const parsedParams = searchParamsSchema.safeParse({
        country: searchParams.get("country"),
        employee_size: searchParams.get("employee_size"),
        domain: searchParams.get("domain"),
    });

    if (!parsedParams.success) {
        return NextResponse.json({ error: parsedParams.error }, { status: 400 });
    }

    const data = await getFilteredData(parsedParams.data);

    return NextResponse.json(data, { status: 200 });
}
