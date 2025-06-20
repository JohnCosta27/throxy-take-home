import { CsvRow } from "../types";
import { maybeTrim } from "../utils";

type ProcessingRecord<T> = {
    [K in keyof T]: (field: T[K]) => T[K]
}

/*
 * We can incrementally add fields and processing functions here.
 * For API calls we could make this async so we're free to do anything we'd like here.
 * I will keep it simple, and just do some basic regex + trimming
 */
const processingFields: Partial<ProcessingRecord<CsvRow>> = {
    domainRaw: (domain) => domain?.replaceAll(" ", "") ?? null,
    companyNameRaw: maybeTrim,
    cityRaw: maybeTrim,
    countryRaw: maybeTrim,
}

export const process = (row: CsvRow): CsvRow => {
    const copiedRow = structuredClone(row);
    for (const [k, v] of Object.entries(copiedRow)) {
        const processingFn = processingFields[k as keyof typeof processingFields];
        if (processingFn == null || v == null) {
            continue
        }

        /*
         * Typescript always struggles with Object.entries functions
         * It can't figure out what I'm trying to do here.
         * SAFETY: We know that Object.entries will return the correct key-value,
         * And we know `processingFn` is typed such that the right key corresponds to the
         * right function.
         */
        //@ts-ignore
        copiedRow[k] = processingFn(v);
    }

    return copiedRow;
}
