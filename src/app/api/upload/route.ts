import { NextResponse } from "next/server";
import { parse } from 'papaparse';

const timeout = (delay: number) => new Promise((r) => setTimeout(r, delay));

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

    await timeout(2_000);
    return NextResponse.json({ id: "csv-id" }, { status: 201 });
}
