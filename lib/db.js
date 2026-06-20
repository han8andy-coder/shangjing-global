import mysql from "mysql2/promise";

const g = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: "+00:00",
  });
}

async function initTables(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(36) PRIMARY KEY,
      reference VARCHAR(30) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      name VARCHAR(120) NOT NULL,
      contact VARCHAR(180) NOT NULL,
      company VARCHAR(180) NOT NULL,
      website VARCHAR(500),
      problem TEXT NOT NULL,
      language VARCHAR(10) NOT NULL DEFAULT 'zh',
      source_page VARCHAR(300),
      referrer VARCHAR(500),
      utm_source VARCHAR(120),
      utm_medium VARCHAR(120),
      utm_campaign VARCHAR(180),
      diagnosis_score INT,
      diagnosis_label VARCHAR(120),
      diagnosis_title VARCHAR(300),
      diagnosis_answers TEXT,
      owner VARCHAR(120),
      next_follow_up_at VARCHAR(40)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS lead_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id VARCHAR(36) NOT NULL,
      activity_type VARCHAR(30) NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id TINYINT UNSIGNED NOT NULL DEFAULT 1,
      password_hash VARCHAR(200) NOT NULL,
      password_salt VARCHAR(100) NOT NULL,
      session_version INT NOT NULL DEFAULT 1,
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      display_name VARCHAR(120) NOT NULL DEFAULT '',
      password_hash VARCHAR(200) NOT NULL,
      password_salt VARCHAR(100) NOT NULL,
      recovery_hash VARCHAR(64) NOT NULL,
      session_version INT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_diagnoses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      score INT NOT NULL,
      label VARCHAR(120) NOT NULL,
      title VARCHAR(300) NOT NULL,
      answers TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const indexes = [
    "CREATE INDEX idx_leads_created_at ON leads(created_at DESC)",
    "CREATE INDEX idx_leads_status ON leads(status)",
    "CREATE INDEX idx_activities_lead_id ON lead_activities(lead_id)",
    "CREATE INDEX idx_users_email ON users(email)",
    "CREATE INDEX idx_user_diagnoses_user_id ON user_diagnoses(user_id)",
  ];
  for (const sql of indexes) {
    try { await pool.execute(sql); } catch { /* index already exists */ }
  }
}

export function getPool() {
  if (!g.__sjgPool) {
    g.__sjgPool = createPool();
    g.__sjgInit = initTables(g.__sjgPool);
  }
  return g.__sjgPool;
}

export async function getDb() {
  const pool = getPool();
  await g.__sjgInit;
  return pool;
}
