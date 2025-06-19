import { NextResponse } from "next/server";
import { parse } from 'papaparse';
import { db } from './db';
import { csvRowsTable, csvsTable } from "./schema";
import { InferInsertModel } from "drizzle-orm";
import { cleanCsv } from "../process/route";

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
     */
    const parsedCsv = parse(content, { header: true });
    if (parsedCsv.errors.length > 0) {
        return NextResponse.json({ error: "CSV could not be parsed without error" }, { status: 400 });
    }

    const cleanedCsv = cleanCsv(parsedCsv.data);
    const fileContent = await file.text();

    const insertedCsvId = await db.transaction(async (tx) => {
        const insertedCsv = await tx.insert(csvsTable).values({ name: file.name, file: fileContent }).returning({ insertedId: csvsTable.id });
        const insertedCsvId = insertedCsv[0].insertedId;

        const rowsToInsert: InferInsertModel<typeof csvRowsTable>[] = cleanedCsv.map(c => ({
            csvId: insertedCsvId,

            companyNameRaw: c.company_name,
            domainRaw: c.domain,
            cityRaw: c.city,
            countryRaw: c.country,
            employeeSizeRaw: c.employee_size,
        }));

        await tx.insert(csvRowsTable).values(rowsToInsert)

        return insertedCsvId;
    })

    // TODO: Handle SQL errors.
    return NextResponse.json({ id: insertedCsvId }, { status: 201 });
}
