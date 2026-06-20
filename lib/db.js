import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const globalDatabase = globalThis;

function createDatabase() {
  const dataDirectory =
    process.env.SJG_DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dataDirectory, { recursive: true });

  const database = new Database(path.join(dataDirectory, "shangjing.db"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");

  database.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      company TEXT NOT NULL,
      website TEXT,
      problem TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'zh',
      source_page TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      diagnosis_score INTEGER,
      diagnosis_label TEXT,
      diagnosis_title TEXT,
      diagnosis_answers TEXT,
      owner TEXT,
      next_follow_up_at TEXT
    );

    CREATE TABLE IF NOT EXISTS lead_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_credentials (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      session_version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leads_created_at
      ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_status
      ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_activities_lead_id
      ON lead_activities(lead_id, created_at DESC);
  `);

  return database;
}

export function getDatabase() {
  if (!globalDatabase.__shangjingDatabase) {
    globalDatabase.__shangjingDatabase = createDatabase();
  }
  return globalDatabase.__shangjingDatabase;
}
