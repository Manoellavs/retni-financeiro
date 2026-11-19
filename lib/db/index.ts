import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForPg = globalThis as typeof globalThis & { financePool?: Pool }

export const pool = globalForPg.financePool ?? new Pool({ connectionString: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== 'production') globalForPg.financePool = pool

export const db = drizzle(pool, { schema })
