import { NextResponse } from "next/server";
import { parse } from 'papaparse';
import { db, supabase } from './db';
import { csvsTable } from "./schema";

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
    const parsedCsv = parse(content);

    if (parsedCsv.errors.length > 0) {
        return NextResponse.json({ error: "CSV could not be parsed without error" }, { status: 400 });
    }

    /*
     * The name should be unique, which is not at all a constraint right now.
     * We should generate some ID before hand and substitute the uri with that.
     * But for now I will leave this as it is.
     */
    const path = file.name;

    const uploadedData = await supabase.storage.from('csvs').upload(path, file);
    if (uploadedData.error == null) {
        return NextResponse.json({ error: "Could not upload CSV to bucket" }, { status: 500 });
    }

    // TODO: Handle SQL errors.
    const insertedCsv = await db.insert(csvsTable).values({ name: file.name, uri: path }).returning({ insertedId: csvsTable.id });
    const insertedCsvId = insertedCsv[0].insertedId;

    return NextResponse.json({ id: insertedCsvId }, { status: 201 });
}
