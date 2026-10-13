// Test helper: runs our Supabase migrations in PGlite (Postgres compiled to
// WebAssembly) with a minimal stand-in for Supabase's auth schema, so
// row-level security can be tested without a server.

import { PGlite } from '@electric-sql/pglite'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm'
// Every migration, in file-name (date) order, as Supabase applies them.
const MIGRATIONS = Object.entries(import.meta.glob('../../supabase/migrations/*.sql', { query: '?raw', import: 'default', eager: true }))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, sql]) => sql as string)

const AUTH_STUB = `
  create role authenticated nologin;
  create role anon nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to authenticated, anon;
`

export interface TestDb {
  db: PGlite
  /** Creates a sign-up (which creates its profile) and returns the user id. */
  signUp(email: string, meta?: Record<string, string>): Promise<string>
  /** Runs queries as the given user, like the app would with their session. */
  as<T>(userId: string | null, fn: (db: PGlite) => Promise<T>): Promise<T>
}

let counter = 0

export async function createTestDb(): Promise<TestDb> {
  const db = new PGlite({ extensions: { pg_trgm } })
  await db.exec(AUTH_STUB)
  for (const sql of MIGRATIONS) await db.exec(sql)

  return {
    db,
    async signUp(email, meta = {}) {
      counter++
      const id = `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`
      await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [id, email, meta])
      return id
    },
    async as(userId, fn) {
      await db.exec(userId ? `set role authenticated; set request.jwt.claim.sub = '${userId}';` : `set role anon; reset request.jwt.claim.sub;`)
      try {
        return await fn(db)
      } finally {
        await db.exec('reset role; reset request.jwt.claim.sub;')
      }
    },
  }
}
