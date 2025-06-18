import { pgTable } from "drizzle-orm/pg-core";

export const csvsTable = pgTable("csvs", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    name: t.text().notNull(),
    uri: t.text().notNull(),
}));
