import { NextResponse } from "next/server";
import { parse } from 'papaparse';
import { db } from './db';
import { csvRowsTable, csvsTable } from "./schema";
import { InferInsertModel } from "drizzle-orm";
import { ParsedRow } from "../types";

const cleanCsv = (data: unknown[]): ParsedRow[] => {
    return data.map((d: any) => ({ company_name: d.company_name, domain: d.domain, city: d.city, country: d.country, employee_size: d.employee_size } satisfies ParsedRow))
}

export async function POST(request: Request) {
    // TODO: add try catch. This could fail
    const formData = await request.formData();

    const file = formData.get("file");
    if (file == null) {
        return NextResponse.json({ error: "Could not find 'file' in form data" }, { status: 400 });
    }

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No valid file was present in 'file' value of form data" }, { status: 400 });
    }

    const content = await file.text();

    /*
     * Parsing is done synchronously. This could be problematic for big CSVs where streaming is more appropriate.
     * However this is not the bottleneck (AI processing is), so I won't solve this problem just yet.
     *
     * @note Papaparse allows parsing errors on specific rows, so it is hard to know when parsing fully failed.
     * Because this is a test, I will be graceful and allow more CSVs than I should.
     */
    const parsedCsv = parse(content, { header: true });
    if (parsedCsv.data.length === 0) {
        return NextResponse.json({ error: "CSV could not be parsed without error", parsingError: parsedCsv.errors }, { status: 400 });
    }

    const cleanedCsv = cleanCsv(parsedCsv.data);
    const fileContent = await file.text();

    const insertedCsvId = await db.transaction(async (tx) => {
        const insertedCsv = await tx.insert(csvsTable).values({ name: file.name, file: fileContent }).returning({ insertedId: csvsTable.id });
        const insertedCsvId = insertedCsv[0].insertedId;

        const rowsToInsert: InferInsertModel<typeof csvRowsTable>[] = cleanedCsv.map(c => ({
            csvId: insertedCsvId,
            status: 'pending',

            companyNameRaw: c.company_name,
            domainRaw: c.domain,
            cityRaw: c.city,
            countryRaw: c.country,
            employeeSizeRaw: c.employee_size,
        }));

        await tx.insert(csvRowsTable).values(rowsToInsert)

        return insertedCsvId;
    })

    /*
     * Fire and forget.
     *
     * This is not actually very good, and we wouldn't run this with the
     * 10 second edge function limit. But we go.
     */
    fetch("http://localhost:3000/api/process", {
        method: "POST",
        body: JSON.stringify({ csvId: insertedCsvId }),
    });

    // TODO: Handle SQL errors.
    return NextResponse.json({ id: insertedCsvId }, { status: 201 });
}
