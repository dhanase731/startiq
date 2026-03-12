import pg from 'pg'

const { Pool } = pg

// If PGPASSWORD is an empty string (e.g. placeholder in .env), remove it so
// pg doesn't attempt SCRAM/SASL authentication with an empty password, which
// always fails even when the DB allows local trust connections.
if (process.env.PGPASSWORD !== undefined && !process.env.PGPASSWORD.trim()) {
  delete process.env.PGPASSWORD
}

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  }
  const cfg = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || 'startiqo',
    user: process.env.PGUSER || 'postgres',
  }
  // Only include password when it is actually provided — omitting it lets
  // PostgreSQL fall back to trust / ident / peer auth for local connections.
  if (process.env.PGPASSWORD) cfg.password = process.env.PGPASSWORD
  return cfg
}

const pool = new Pool(buildPoolConfig())

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message)
})

/**
 * Creates all required tables if they do not already exist.
 * Safe to call on every startup — fully idempotent.
 */
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT        PRIMARY KEY,
      full_name    TEXT        NOT NULL,
      email        TEXT        UNIQUE NOT NULL,
      password_hash TEXT       NOT NULL,
      role         TEXT        NOT NULL DEFAULT 'user',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS applications (
      id           TEXT        PRIMARY KEY,
      role         TEXT        NOT NULL,
      payload      JSONB       NOT NULL,
      status       TEXT        NOT NULL DEFAULT 'received',
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS applications_role_idx ON applications (role);
    CREATE INDEX IF NOT EXISTS applications_status_idx ON applications (status);
  `)

  console.log('✔  Database tables ready.')
}

export default pool
