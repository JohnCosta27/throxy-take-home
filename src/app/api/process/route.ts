import { eq } from "drizzle-orm";
import { db } from "../upload/db";
import { csvRowsTable } from "../upload/schema";
import { NextResponse } from "next/server";
import { chunkRows, DEFAULT_CHUNK_SIZE, timeout, zip } from "../utils";
import { process } from './process';
import { enhanceAndClean } from "./ai-enhance";

type ProcessBody = {
    csvId: string;
}

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
