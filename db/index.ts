import 'server-only';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
function connect() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000 });
  attachDatabasePool(pool);
  return drizzle(pool, { schema });
}
let database: ReturnType<typeof connect> | undefined;
export function db() { return database ??= connect(); }
