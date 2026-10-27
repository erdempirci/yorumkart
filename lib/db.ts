import { createClient, type Client, type InValue } from "@libsql/client";

let client: Client | null = null;
let ready: Promise<void> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    google_url TEXT,
    wa_template TEXT,
    color TEXT NOT NULL DEFAULT '#1f6f5c',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    customer_name TEXT,
    phone_last4 TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    opened_at TEXT,
    clicked_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    contact TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_biz ON events(business_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_requests_biz ON requests(business_id, created_at)`,
  // Satış görüşmelerinde gösterilen demo işletme (giriş yapılamaz: geçersiz şifre özeti)
  `INSERT OR IGNORE INTO businesses (slug, name, email, password_hash, google_url, color)
   VALUES ('demo-kafe', 'Demo Kafe', 'demo@yorumkart.local', '!', NULL, '#1f6f5c')`,
];

export const DEMO_SLUG = "demo-kafe";

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.DATABASE_URL || "file:./data/local.db",
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

async function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const c = getClient();
      for (const stmt of SCHEMA) await c.execute(stmt);
    })();
  }
  return ready;
}

export async function query<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await getClient().execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function one<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InValue[] = []) {
  await ensureSchema();
  const res = await getClient().execute({ sql, args });
  return { lastId: res.lastInsertRowid != null ? Number(res.lastInsertRowid) : null, changes: res.rowsAffected };
}

export type Business = {
  id: number;
  slug: string;
  name: string;
  email: string;
  password_hash: string;
  google_url: string | null;
  wa_template: string | null;
  color: string;
  created_at: string;
};
