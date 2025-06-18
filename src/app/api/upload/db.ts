import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js'

import '../envConfig.ts'

export const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client);


export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
