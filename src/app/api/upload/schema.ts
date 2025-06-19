import { pgTable } from "drizzle-orm/pg-core";

export const csvsTable = pgTable("csvs", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    name: t.text().notNull(),

    /* We can store the file in `TEXT` type because of TOAST
     * @link https://www.postgresql.org/docs/current/storage-toast.html
     *
     * TLDR: If the value is larger than a regular DB page size (and other euristics),
     * Postgres will take it out of the row and store it somewhere else, leaving a pointer
     * behind. This means for files under 1GB (roughly), we can store them directly in the
     * database, and avoid having a third system (like an S3 bucket).
     */
    file: t.text().notNull(),
}));
