import { NextResponse } from "next/server";
import { z } from "zod";
import { getFilteredData, searchParamsSchema } from "../utils";

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
