import { InferInsertModel } from "drizzle-orm";
import { csvRowsTable } from "./upload/schema";

export type CsvRow = InferInsertModel<typeof csvRowsTable>;

export const CSV_COLUMNS = ["company_name", "domain", "city", "country", "employee_size"] as const
export type ParsedRow = Record<(typeof CSV_COLUMNS)[number], string>;

