import { pgEnum, pgTable } from "drizzle-orm/pg-core";

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

export const processingStatus = pgEnum('status', ['pending', 'processing', 'processed']);

/* There is a world where I would have each of these attributes,
 * be their own table instead of just text.
 *
 * This would make it better in a system where we want to filter for
 * only a specific city, because we could use foreign keys to 
 * uphold contraints, rename every and stuff like that.
 *
 * But for this simple system, I will leave it like this to avoid
 * over-engineering it.
 */
export const csvRowsTable = pgTable("csvRows", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    csvId: t.uuid().references(() => csvsTable.id).notNull(),

    companyNameRaw: t.text(),
    companyName: t.text(),

    cityRaw: t.text(),
    city: t.text(),

    countryRaw: t.text(),
    country: t.text(),

    // TODO: this doesnt feel right, since it's really a number.
    // But I want to store buckets so I will leave this for now.
    employeeSizeRaw: t.text(),
    employeeSize: t.text(),

    status: processingStatus().default('pending').notNull(),
}));
