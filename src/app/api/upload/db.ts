import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import '../envConfig.ts'

export const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client);
