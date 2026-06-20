# 商镜Global：MySQL迁移 + 用户注册/登录/密码找回 + PWA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将商镜Global数据库从SQLite迁移到MySQL（与Grandlink统一），在此基础上新增前台用户注册/登录/密码找回，最后加PWA支持。

**Architecture:** 用mysql2替换better-sqlite3；`lib/db.js`改为导出`getPool()`（异步初始化表结构）；所有lib函数改为async/await；密码找回用注册时生成的恢复码（无需邮件服务，与管理员ADMIN_RECOVERY_KEY模式一致）；用户session用独立Cookie`sjg_user_session`与管理员完全分离。

**Tech Stack:** Next.js 15 App Router、MySQL 8.0+、mysql2、Node.js crypto（scrypt+HMAC）、无新增外部认证库

## Global Constraints

- 数据库：MySQL，连接参数从环境变量读取（MYSQL_HOST/PORT/USER/PASSWORD/DATABASE）
- 不引入NextAuth、bcrypt、jsonwebtoken等外部认证库
- API路由`app/api/user/`与`app/api/admin/`完全隔离
- 密码规则：用户至少8位含字母和数字，管理员至少12位
- 用户Session有效期30天，管理员12小时
- **不安装任何新npm包（只加mysql2，移除better-sqlite3使用）**
- 所有前台页面只做中文版（/路径），英文版不扩展

---

## 文件清单

### Task A：MySQL迁移（修改现有文件）
| 文件 | 改动 |
|---|---|
| `lib/db.js` | 完全重写：mysql2 pool + 异步建表 |
| `lib/auth.js` | 全部函数改async/await，SQL改MySQL语法 |
| `lib/leads.js` | 全部函数改async/await，SQL改MySQL语法 |
| `app/api/leads/route.js` | `await createLead()` |
| `app/api/admin/leads/route.js` | `await isAdminRequest()`, `await listLeads()` |
| `app/api/admin/leads/[id]/route.js` | `await isAdminRequest()`, `await getLead()`, `await updateLead()` |
| `app/api/admin/login/route.js` | `await passwordMatches()`, `await createSessionToken()` |
| `app/api/admin/recover/route.js` | `await resetAdminPassword()` |
| `app/admin/page.js` | `await getDashboardData()` |
| `app/admin/leads/page.js` | `await listLeads()` |
| `app/admin/leads/[id]/page.js` | `await getLead()` |
| `.env.example` | 新增MYSQL_*变量，移除SJG_DATA_DIR |
| `package.json` | 安装mysql2 |

### Task B：用户认证（新建文件）
| 文件 | 作用 |
|---|---|
| `lib/user-auth.js` | 用户认证：注册/登录/session/恢复码重置密码 |
| `app/register/page.js` | 注册页（完成后显示恢复码） |
| `app/login/page.js` | 登录页 |
| `app/forgot-password/page.js` | 恢复码重置密码页 |
| `app/account/page.js` | 账户主页（Server Component，查诊断历史） |
| `app/account/AccountClient.js` | 账户页客户端组件 |
| `app/api/user/register/route.js` | 注册API |
| `app/api/user/login/route.js` | 登录API |
| `app/api/user/logout/route.js` | 登出API |
| `app/api/user/forgot-password/route.js` | 恢复码重置密码API |
| `app/api/user/me/route.js` | 当前用户信息API |
| `app/api/user/diagnoses/route.js` | 诊断历史保存/读取API |

### Task C：联动修改
| 文件 | 改动 |
|---|---|
| `app/Header.js` | 加登录/账户导航入口 |
| `app/diagnosis/page.js` | 诊断完成时若已登录则保存到DB |

### Task D：PWA（最后）
| 文件 | 作用 |
|---|---|
| `public/manifest.json` | PWA清单 |
| `public/sw.js` | 最小Service Worker |
| `app/layout.js` | 加PWA meta标签 |

---

## Task A1：安装mysql2，更新环境变量

**Files:**
- Modify: `package.json`（npm install）
- Modify: `.env.example`

- [ ] **Step 1: 安装mysql2**

```bash
cd D:\shangjing-global
npm install mysql2
```

期望输出：`added 1 package`，无报错。

- [ ] **Step 2: 更新 .env.example**

将现有内容替换为：

```
# MySQL database (same server as other projects)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=replace-with-db-user
MYSQL_PASSWORD=replace-with-db-password
MYSQL_DATABASE=shangjing_global

# Admin access: use a unique password with at least 12 characters
ADMIN_PASSWORD=replace-with-a-strong-admin-password

# Emergency password recovery key: keep offline, use at least 20 characters
ADMIN_RECOVERY_KEY=replace-with-a-separate-long-recovery-key

# Session signing: generate at least 32 random characters
SESSION_SECRET=replace-with-a-long-random-session-secret

# Public WhatsApp number, digits only
NEXT_PUBLIC_WHATSAPP_NUMBER=13475768888
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: 安装mysql2，更新环境变量配置"
```

---

## Task A2：重写 lib/db.js

**Files:**
- Rewrite: `lib/db.js`

**Interfaces:**
- Produces: `getPool()` → mysql2 Pool（同步，首次调用时异步初始化表）
- Produces: `getDb()` → Promise\<Pool\>（等待初始化完成后返回pool）

- [ ] **Step 1: 完全重写 lib/db.js**

```js
import mysql from "mysql2/promise";

const g = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/db.js
git commit -m "feat: lib/db.js 改用mysql2，异步初始化5张表"
```

---

## Task A3：重写 lib/auth.js（管理员认证，改async）

**Files:**
- Rewrite: `lib/auth.js`

**Interfaces:**
- Produces（均改为async）: `passwordMatches(pwd)`, `createSessionToken()`, `verifySessionToken(token)`, `isAdminRequest(req)`, `requireAdminPage()`, `resetAdminPassword(newPwd)`
- Produces（仍然同步）: `recoveryKeyMatches(key)`, `SESSION_COOKIE`

- [ ] **Step 1: 完全重写 lib/auth.js**

```js
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export const SESSION_COOKIE = "sjg_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return secret;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString("base64url");
}

function validateNewPassword(password) {
  const v = String(password || "");
  if (v.length < 12) return "新密码至少需要 12 个字符。";
  if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return "新密码必须同时包含字母和数字。";
  return "";
}

async function getCredential() {
  const db = await getDb();
  const [rows] = await db.execute("SELECT * FROM admin_credentials WHERE id = 1");
  let credential = rows[0];

  if (!credential) {
    const initialPassword = process.env.ADMIN_PASSWORD;
    const passwordError = validateNewPassword(initialPassword);
    if (passwordError) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters, letters and numbers.");
    }
    const salt = crypto.randomBytes(24).toString("base64url");
    await db.execute(
      "INSERT INTO admin_credentials (id, password_hash, password_salt, session_version) VALUES (1, ?, ?, 1)",
      [hashPassword(initialPassword, salt), salt]
    );
    const [newRows] = await db.execute("SELECT * FROM admin_credentials WHERE id = 1");
    credential = newRows[0];
  }

  return credential;
}

export async function passwordMatches(password) {
  const credential = await getCredential();
  return safeEqual(
    hashPassword(password, credential.password_salt),
    credential.password_hash
  );
}

export function recoveryKeyMatches(recoveryKey) {
  const expected = process.env.ADMIN_RECOVERY_KEY;
  if (!expected || expected.length < 20) {
    throw new Error("ADMIN_RECOVERY_KEY must be at least 20 characters.");
  }
  return safeEqual(String(recoveryKey || ""), expected);
}

export async function resetAdminPassword(newPassword) {
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const db = await getDb();
  await getCredential();
  const salt = crypto.randomBytes(24).toString("base64url");
  await db.execute(
    "UPDATE admin_credentials SET password_hash = ?, password_salt = ?, session_version = session_version + 1, updated_at = NOW() WHERE id = 1",
    [hashPassword(newPassword, salt), salt]
  );
  return { ok: true };
}

export async function createSessionToken() {
  const credential = await getCredential();
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      version: credential.session_version,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      parsed.role !== "admin" ||
      !Number.isFinite(parsed.expiresAt) ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) return false;

    const credential = await getCredential();
    return parsed.version === credential.session_version;
  } catch {
    return false;
  }
}

export async function isAdminRequest(request) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireAdminPage() {
  const cookieStore = await cookies();
  const valid = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!valid) redirect("/admin/login");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.js
git commit -m "feat: lib/auth.js 改async，使用MySQL"
```

---

## Task A4：重写 lib/leads.js（改async，SQL改MySQL语法）

**Files:**
- Rewrite: `lib/leads.js`

- [ ] **Step 1: 完全重写 lib/leads.js**

```js
import crypto from "node:crypto";
import { getDb } from "./db";
import { isLeadStatus } from "./lead-status";

function cleanText(value, maximumLength) {
  return String(value || "").trim().slice(0, maximumLength);
}

function normalizeWebsite(value) {
  const website = cleanText(value, 500);
  if (!website) return "";
  try {
    const parsed = new URL(website);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SJG-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function validateLeadPayload(payload) {
  const lead = {
    name: cleanText(payload.name, 120),
    contact: cleanText(payload.contact, 180),
    company: cleanText(payload.company, 180),
    website: normalizeWebsite(payload.website),
    problem: cleanText(payload.problem, 3000),
    language: payload.language === "en" ? "en" : "zh",
    sourcePage: cleanText(payload.sourcePage, 300),
    referrer: cleanText(payload.referrer, 500),
    utmSource: cleanText(payload.utmSource, 120),
    utmMedium: cleanText(payload.utmMedium, 120),
    utmCampaign: cleanText(payload.utmCampaign, 180),
    honeypot: cleanText(payload.companyWebsite, 200),
    diagnosis:
      payload.diagnosis && typeof payload.diagnosis === "object"
        ? payload.diagnosis
        : null,
  };

  if (lead.honeypot) return { ok: false, silent: true };
  if (!lead.name || !lead.contact || !lead.company || !lead.problem) {
    return { ok: false, error: "请填写所有必填信息。" };
  }
  if (payload.website && !lead.website) {
    return { ok: false, error: "网站链接格式不正确。" };
  }

  return { ok: true, lead };
}

export async function createLead(lead) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const reference = createReference();
  const diagnosisScore = Number(lead.diagnosis?.score);
  const validDiagnosisScore =
    Number.isInteger(diagnosisScore) && diagnosisScore >= 0 && diagnosisScore <= 100
      ? diagnosisScore
      : null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO leads (
        id, reference, name, contact, company, website, problem, language,
        source_page, referrer, utm_source, utm_medium, utm_campaign,
        diagnosis_score, diagnosis_label, diagnosis_title, diagnosis_answers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, reference, lead.name, lead.contact, lead.company,
        lead.website || null, lead.problem, lead.language,
        lead.sourcePage || null, lead.referrer || null,
        lead.utmSource || null, lead.utmMedium || null, lead.utmCampaign || null,
        validDiagnosisScore,
        cleanText(lead.diagnosis?.label, 120) || null,
        cleanText(lead.diagnosis?.title, 300) || null,
        lead.diagnosis?.answers ? JSON.stringify(lead.diagnosis.answers) : null,
      ]
    );
    await conn.execute(
      "INSERT INTO lead_activities (lead_id, activity_type, note) VALUES (?, 'created', ?)",
      [id, lead.language === "en" ? "Lead submitted through the website." : "客户通过网站提交咨询。"]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { id, reference };
}

export async function getDashboardData() {
  const db = await getDb();
  const [[totals]] = await db.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS last_seven_days,
      SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won
    FROM leads
  `);
  const [byStatus] = await db.execute(
    "SELECT status, COUNT(*) AS count FROM leads GROUP BY status"
  );
  const [recent] = await db.execute(
    "SELECT * FROM leads ORDER BY created_at DESC LIMIT 8"
  );
  return { totals, byStatus, recent };
}

export async function listLeads({ status = "", search = "" } = {}) {
  const db = await getDb();
  const conditions = [];
  const params = [];

  if (status && isLeadStatus(status)) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (search) {
    conditions.push(
      "(name LIKE ? OR company LIKE ? OR contact LIKE ? OR reference LIKE ?)"
    );
    const s = `%${cleanText(search, 120)}%`;
    params.push(s, s, s, s);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.execute(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  return rows;
}

export async function getLead(id) {
  const db = await getDb();
  const [[lead]] = await db.execute("SELECT * FROM leads WHERE id = ?", [id]);
  if (!lead) return null;
  const [activities] = await db.execute(
    "SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC",
    [id]
  );
  return { lead, activities };
}

export async function updateLead(id, payload) {
  const db = await getDb();
  const [[current]] = await db.execute("SELECT * FROM leads WHERE id = ?", [id]);
  if (!current) return null;

  const status = isLeadStatus(payload.status) ? payload.status : current.status;
  const owner = cleanText(payload.owner, 120) || null;
  const nextFollowUpAt = cleanText(payload.nextFollowUpAt, 40) || null;
  const note = cleanText(payload.note, 3000);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      "UPDATE leads SET status = ?, owner = ?, next_follow_up_at = ?, updated_at = NOW() WHERE id = ?",
      [status, owner, nextFollowUpAt, id]
    );
    if (status !== current.status) {
      await conn.execute(
        "INSERT INTO lead_activities (lead_id, activity_type, note) VALUES (?, 'status', ?)",
        [id, `状态从 ${current.status} 更新为 ${status}`]
      );
    }
    if (note) {
      await conn.execute(
        "INSERT INTO lead_activities (lead_id, activity_type, note) VALUES (?, 'note', ?)",
        [id, note]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return getLead(id);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/leads.js
git commit -m "feat: lib/leads.js 改async，使用MySQL"
```

---

## Task A5：更新所有调用DB的文件（API路由 + Admin页面）

**Files:**
- Modify: `app/api/leads/route.js`
- Modify: `app/api/admin/leads/route.js`
- Modify: `app/api/admin/leads/[id]/route.js`
- Modify: `app/api/admin/login/route.js`
- Modify: `app/api/admin/recover/route.js`
- Modify: `app/admin/page.js`
- Modify: `app/admin/leads/page.js`（需要读文件确认调用方式）
- Modify: `app/admin/leads/[id]/page.js`（需要读文件确认调用方式）

- [ ] **Step 1: 更新 app/api/leads/route.js**

将 `const result = createLead(validation.lead);` 改为：

```js
const result = await createLead(validation.lead);
```

- [ ] **Step 2: 更新 app/api/admin/leads/route.js**

```js
if (!await isAdminRequest(request)) {
  return NextResponse.json({ ok: false }, { status: 401 });
}
// ...
const leads = await listLeads({ status: ..., search: ... });
```

- [ ] **Step 3: 更新 app/api/admin/leads/[id]/route.js**

```js
if (!await isAdminRequest(request)) { ... }
// GET:
const result = await getLead(id);
// PATCH:
const result = await updateLead(id, payload);
```

- [ ] **Step 4: 更新 app/api/admin/login/route.js**

```js
if (!await passwordMatches(password)) { ... }
// ...
const token = await createSessionToken();
response.cookies.set(SESSION_COOKIE, token, { ... });
```

- [ ] **Step 5: 更新 app/api/admin/recover/route.js**

```js
const result = await resetAdminPassword(newPassword);
```

（注意：`recoveryKeyMatches` 保持同步，不需要await）

- [ ] **Step 6: 更新 app/admin/page.js**

```js
const { totals, byStatus, recent } = await getDashboardData();
```

- [ ] **Step 7: 读取并更新 app/admin/leads/page.js 和 app/admin/leads/[id]/page.js**

先 Read 这两个文件，找到调用 `listLeads()` 或 `getLead()` 的地方，加 `await`。

- [ ] **Step 8: Build 验证**

```bash
npm run build
```

期望：编译通过，所有页面正常生成，无async/await相关错误。

- [ ] **Step 9: Commit**

```bash
git add app/api/ app/admin/
git commit -m "feat: 所有API路由和Admin页面改用async DB调用"
```

---

## Task B1：用户认证库（lib/user-auth.js）

**Files:**
- Create: `lib/user-auth.js`

**Interfaces:**
- Produces: `registerUser(email, displayName, password)` → `{ ok, error, userId, recoveryCode }`
- Produces: `loginUser(email, password)` → `{ ok, error, userId }`
- Produces: `createUserSessionToken(userId)` → Promise\<string\>
- Produces: `verifyUserSessionToken(token)` → Promise\<{ valid, userId } | { valid: false }\>
- Produces: `getUserById(id)` → Promise\<user | null\>
- Produces: `resetPasswordWithRecoveryCode(email, recoveryCode, newPassword)` → Promise\<{ ok, error? }\>
- Produces: `requireUserPage()` → Promise\<void\>（未登录则redirect('/login')）
- Produces: `getCurrentUser()` → Promise\<user | null\>
- Produces: `isUserRequest(request)` → Promise\<boolean\>
- Produces: `USER_SESSION_COOKIE` → string

- [ ] **Step 1: 创建 lib/user-auth.js**

```js
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

export const USER_SESSION_COOKIE = "sjg_user_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return secret;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString("base64url");
}

function hashRecoveryCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function validatePassword(password) {
  const v = String(password || "");
  if (v.length < 8) return "密码至少需要 8 个字符。";
  if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return "密码必须同时包含字母和数字。";
  return "";
}

export async function registerUser(email, displayName, password) {
  const db = await getDb();
  const emailClean = String(email || "").trim().toLowerCase();
  if (!emailClean.includes("@") || !emailClean.includes(".")) {
    return { ok: false, error: "请输入有效的邮箱地址。" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  const [[existing]] = await db.execute(
    "SELECT id FROM users WHERE email = ?", [emailClean]
  );
  if (existing) return { ok: false, error: "该邮箱已注册，请直接登录。" };

  const salt = crypto.randomBytes(24).toString("base64url");
  const userId = crypto.randomUUID();
  const rawRecoveryCode = [
    crypto.randomBytes(3).toString("hex").toUpperCase(),
    crypto.randomBytes(3).toString("hex").toUpperCase(),
    crypto.randomBytes(3).toString("hex").toUpperCase(),
    crypto.randomBytes(3).toString("hex").toUpperCase(),
  ].join("-");

  await db.execute(
    `INSERT INTO users (id, email, display_name, password_hash, password_salt, recovery_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, emailClean, String(displayName || "").trim(),
     hashPassword(password, salt), salt, hashRecoveryCode(rawRecoveryCode)]
  );

  return { ok: true, userId, recoveryCode: rawRecoveryCode };
}

export async function loginUser(email, password) {
  const db = await getDb();
  const emailClean = String(email || "").trim().toLowerCase();
  const [[user]] = await db.execute(
    "SELECT * FROM users WHERE email = ?", [emailClean]
  );
  if (!user) return { ok: false, error: "邮箱或密码不正确。" };
  if (!safeEqual(hashPassword(password, user.password_salt), user.password_hash)) {
    return { ok: false, error: "邮箱或密码不正确。" };
  }
  return { ok: true, userId: user.id };
}

export async function createUserSessionToken(userId) {
  const db = await getDb();
  const [[user]] = await db.execute(
    "SELECT session_version FROM users WHERE id = ?", [userId]
  );
  if (!user) throw new Error("User not found");

  const payload = Buffer.from(
    JSON.stringify({
      role: "user",
      uid: userId,
      version: user.session_version,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export async function verifyUserSessionToken(token) {
  if (!token || !token.includes(".")) return { valid: false };
  const [payload, signature] = token.split(".");
  if (!safeEqual(signature, sign(payload))) return { valid: false };

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      parsed.role !== "user" ||
      !Number.isFinite(parsed.expiresAt) ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) return { valid: false };

    const db = await getDb();
    const [[u]] = await db.execute(
      "SELECT session_version FROM users WHERE id = ?", [parsed.uid]
    );
    if (!u || u.session_version !== parsed.version) return { valid: false };

    return { valid: true, userId: parsed.uid };
  } catch {
    return { valid: false };
  }
}

export async function getUserById(id) {
  const db = await getDb();
  const [[user]] = await db.execute(
    "SELECT id, email, display_name, created_at FROM users WHERE id = ?", [id]
  );
  return user || null;
}

export async function isUserRequest(request) {
  const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
  const { valid } = await verifyUserSessionToken(token);
  return valid;
}

export async function requireUserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  const { valid } = await verifyUserSessionToken(token);
  if (!valid) redirect("/login");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  const { valid, userId } = await verifyUserSessionToken(token);
  if (!valid) return null;
  return getUserById(userId);
}

export async function resetPasswordWithRecoveryCode(email, recoveryCode, newPassword) {
  const passwordError = validatePassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const db = await getDb();
  const emailClean = String(email || "").trim().toLowerCase();
  const [[user]] = await db.execute(
    "SELECT * FROM users WHERE email = ?", [emailClean]
  );

  if (!user || !safeEqual(hashRecoveryCode(recoveryCode), user.recovery_hash)) {
    return { ok: false, error: "邮箱或恢复码不正确。" };
  }

  const salt = crypto.randomBytes(24).toString("base64url");
  await db.execute(
    `UPDATE users SET password_hash = ?, password_salt = ?,
     session_version = session_version + 1, updated_at = NOW() WHERE id = ?`,
    [hashPassword(newPassword, salt), salt, user.id]
  );

  return { ok: true };
}
```

- [ ] **Step 2: Build 验证**

```bash
npm run build
```

期望：通过，无导入错误。

- [ ] **Step 3: Commit**

```bash
git add lib/user-auth.js
git commit -m "feat: 用户认证库（注册/登录/session/恢复码重置，MySQL版）"
```

---

## Task B2：用户 API 路由

**Files:**
- Create: `app/api/user/register/route.js`
- Create: `app/api/user/login/route.js`
- Create: `app/api/user/logout/route.js`
- Create: `app/api/user/forgot-password/route.js`
- Create: `app/api/user/me/route.js`
- Create: `app/api/user/diagnoses/route.js`

- [ ] **Step 1: 创建 app/api/user/register/route.js**

```js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerUser, createUserSessionToken, USER_SESSION_COOKIE } from "@/lib/user-auth";

export async function POST(request) {
  try {
    const { email, displayName, password } = await request.json();
    const result = await registerUser(email, displayName, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const token = await createUserSessionToken(result.userId);
    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true, recoveryCode: result.recoveryCode });
  } catch {
    return NextResponse.json({ error: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 创建 app/api/user/login/route.js**

```js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginUser, createUserSessionToken, USER_SESSION_COOKIE } from "@/lib/user-auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const result = await loginUser(email, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

    const token = await createUserSessionToken(result.userId);
    const cookieStore = await cookies();
    cookieStore.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "登录失败，请稍后重试。" }, { status: 500 });
  }
}
```

- [ ] **Step 3: 创建 app/api/user/logout/route.js**

```js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_SESSION_COOKIE } from "@/lib/user-auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: 创建 app/api/user/forgot-password/route.js**

```js
import { NextResponse } from "next/server";
import { resetPasswordWithRecoveryCode } from "@/lib/user-auth";

export async function POST(request) {
  try {
    const { email, recoveryCode, newPassword } = await request.json();
    const result = await resetPasswordWithRecoveryCode(email, recoveryCode, newPassword);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "重置失败，请稍后重试。" }, { status: 500 });
  }
}
```

- [ ] **Step 5: 创建 app/api/user/me/route.js**

```js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
```

- [ ] **Step 6: 创建 app/api/user/diagnoses/route.js**

```js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { getDb } from "@/lib/db";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const { score, label, title, answers } = await request.json();
    if (typeof score !== "number" || !label || !title) {
      return NextResponse.json({ error: "数据格式不正确" }, { status: 400 });
    }
    const db = await getDb();
    await db.execute(
      "INSERT INTO user_diagnoses (user_id, score, label, title, answers) VALUES (?, ?, ?, ?, ?)",
      [user.id, score, label, title, JSON.stringify(answers || {})]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ diagnoses: [] }, { status: 401 });

  const db = await getDb();
  const [diagnoses] = await db.execute(
    "SELECT id, score, label, title, created_at FROM user_diagnoses WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [user.id]
  );
  return NextResponse.json({ diagnoses });
}
```

- [ ] **Step 7: Build 验证**

```bash
npm run build
```

期望：通过，所有user API路由正常编译。

- [ ] **Step 8: Commit**

```bash
git add app/api/user/
git commit -m "feat: 用户API路由（注册/登录/登出/恢复码重置/诊断历史）"
```

---

## Task B3：前台页面（注册/登录/找回密码）

**Files:**
- Create: `app/register/page.js`
- Create: `app/login/page.js`
- Create: `app/forgot-password/page.js`

复用现有 `.admin-login-page` 和 `.admin-login-card` CSS类。

- [ ] **Step 1: 创建 app/register/page.js**

```jsx
"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", displayName: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("两次输入的密码不一致。");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, displayName: form.displayName, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "注册失败。");
      setRecoveryCode(data.recoveryCode);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (recoveryCode && !confirmed) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <p className="eyebrow">注册成功</p>
          <h1>保存您的恢复码</h1>
          <p>这是您<strong>唯一的密码找回方式</strong>，请立即截图或抄写，关闭此页面后无法再次查看。</p>
          <div style={{
            margin: "20px 0", padding: "20px",
            background: "#f5f8fc", border: "2px solid var(--accent)",
            borderRadius: 10, textAlign: "center",
            fontSize: 20, fontWeight: 900, letterSpacing: 3, color: "var(--ink)",
          }}>
            {recoveryCode}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            忘记密码时，在"找回密码"页面输入此码即可重置。
          </p>
          <button className="button primary wide" onClick={() => setConfirmed(true)}>
            已保存，进入账户
          </button>
        </div>
      </div>
    );
  }

  if (confirmed) {
    if (typeof window !== "undefined") window.location.href = "/account";
    return null;
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>创建账户</h1>
        <p>注册后可保存诊断记录，随时查看增长建议。</p>
        <form onSubmit={submit}>
          <label htmlFor="reg-name">您的称呼</label>
          <input id="reg-name" type="text" autoComplete="name" value={form.displayName} onChange={update("displayName")} placeholder="例：张总" required />
          <label htmlFor="reg-email">邮箱</label>
          <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
          <label htmlFor="reg-password">密码</label>
          <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={update("password")} minLength={8} required />
          <p className="admin-password-hint">至少 8 个字符，含字母和数字。</p>
          <label htmlFor="reg-confirm">确认密码</label>
          <input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update("confirm")} minLength={8} required />
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "注册中…" : "立即注册"}
          </button>
          <a className="admin-forgot-link" href="/login">已有账户？立即登录</a>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 app/login/page.js**

```jsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "登录失败。");
      window.location.href = "/account";
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>用户登录</h1>
        <form onSubmit={submit}>
          <label htmlFor="login-email">邮箱</label>
          <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
          <label htmlFor="login-password">密码</label>
          <input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={update("password")} required />
          {error && <p className="form-error">{error}</p>}
          <button className="button primary wide" disabled={submitting}>
            {submitting ? "登录中…" : "登录"}
          </button>
          <a className="admin-forgot-link" href="/forgot-password">忘记密码？</a>
          <a className="admin-forgot-link" href="/register">还没有账户？立即注册</a>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 app/forgot-password/page.js**

```jsx
"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: "", recoveryCode: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) return setError("两次密码不一致。");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, recoveryCode: form.recoveryCode.trim(), newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重置失败。");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">SHANGJING GLOBAL</p>
        <h1>找回密码</h1>
        {success ? (
          <>
            <p>密码已重置成功！请使用新密码登录。</p>
            <a className="button primary wide" href="/login" style={{ display: "block", textAlign: "center", marginTop: 16 }}>前往登录</a>
          </>
        ) : (
          <form onSubmit={submit}>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>输入注册邮箱和注册时保存的恢复码，即可重置密码。</p>
            <label htmlFor="fp-email">注册邮箱</label>
            <input id="fp-email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
            <label htmlFor="fp-code">恢复码</label>
            <input id="fp-code" type="text" autoComplete="off" value={form.recoveryCode} onChange={update("recoveryCode")} placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" required />
            <label htmlFor="fp-pwd">新密码</label>
            <input id="fp-pwd" type="password" autoComplete="new-password" value={form.newPassword} onChange={update("newPassword")} minLength={8} required />
            <p className="admin-password-hint">至少 8 个字符，含字母和数字。</p>
            <label htmlFor="fp-confirm">确认新密码</label>
            <input id="fp-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update("confirm")} minLength={8} required />
            {error && <p className="form-error">{error}</p>}
            <button className="button primary wide" disabled={submitting}>
              {submitting ? "重置中…" : "确认重置密码"}
            </button>
            <a className="admin-forgot-link" href="/login">返回登录</a>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build 验证**

```bash
npm run build
```

期望：3个新页面正常生成。

- [ ] **Step 5: Commit**

```bash
git add app/register/ app/login/ app/forgot-password/
git commit -m "feat: 注册/登录/找回密码页面（恢复码方式，无邮件服务）"
```

---

## Task B4：账户页 + 诊断历史保存

**Files:**
- Create: `app/account/page.js`
- Create: `app/account/AccountClient.js`
- Modify: `app/diagnosis/page.js`

- [ ] **Step 1: 创建 app/account/page.js**

```jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getDb } from "@/lib/db";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = await getDb();
  const [diagnoses] = await db.execute(
    "SELECT id, score, label, title, created_at FROM user_diagnoses WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [user.id]
  );

  return <AccountClient user={user} diagnoses={diagnoses} />;
}
```

- [ ] **Step 2: 创建 app/account/AccountClient.js**

```jsx
"use client";

export default function AccountClient({ user, diagnoses }) {
  async function logout() {
    await fetch("/api/user/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="admin-content" style={{ paddingTop: 60 }}>
      <div className="admin-heading">
        <div>
          <h1>我的账户</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>{user.display_name || user.email}</p>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{user.email}</p>
        </div>
        <button className="button" onClick={logout}>退出登录</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>诊断历史</h2>
          <a href="/diagnosis" className="button primary">再次诊断</a>
        </div>
        {diagnoses.length === 0 ? (
          <div className="admin-empty">
            <p>还没有诊断记录。完成诊断后，结果会自动保存到这里。</p>
            <a className="button primary" href="/diagnosis" style={{ display: "inline-block", marginTop: 12 }}>立即免费诊断</a>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>日期</th><th>得分</th><th>评级</th><th>结论</th></tr>
              </thead>
              <tbody>
                {diagnoses.map((d) => (
                  <tr key={d.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(d.created_at).toLocaleDateString("zh-CN")}</td>
                    <td><strong style={{ color: "var(--brand)", fontSize: 18 }}>{d.score}</strong><span style={{ color: "var(--muted)", fontSize: 12 }}>/100</span></td>
                    <td>{d.label}</td>
                    <td style={{ color: "var(--muted)" }}>{d.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 修改 app/diagnosis/page.js**

找到保存localStorage的`useEffect`，在`localStorage.setItem(...)`之后追加（fire-and-forget，不影响主流程）：

```js
fetch("/api/user/me")
  .then((r) => r.json())
  .then(({ user }) => {
    if (!user) return;
    return fetch("/api/user/diagnoses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, label: advice.label, title: advice.title, answers }),
    });
  })
  .catch(() => {});
```

- [ ] **Step 4: Build 验证**

```bash
npm run build
```

期望：通过，account页面正常生成。

- [ ] **Step 5: Commit**

```bash
git add app/account/ app/diagnosis/page.js
git commit -m "feat: 账户页诊断历史 + 登录状态自动保存诊断结果"
```

---

## Task C：Header 加登录状态入口

**Files:**
- Modify: `app/Header.js`

- [ ] **Step 1: 读 Header.js，确认是否有 `"use client"`**

```bash
grep -n "use client" D:\shangjing-global\app\Header.js
```

**如果没有 `"use client"`（Server Component）：**

在顶部加：
```js
import { cookies } from "next/headers";
import { verifyUserSessionToken, USER_SESSION_COOKIE } from "@/lib/user-auth";
```

把组件改为async，读取登录状态：
```js
export default async function Header() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  const { valid: isLoggedIn } = await verifyUserSessionToken(token);
  // ...现有Header代码
```

在导航末尾加：
```jsx
{isLoggedIn ? (
  <a href="/account" className="nav-link">我的账户</a>
) : (
  <a href="/login" className="nav-link">登录</a>
)}
```

**如果有 `"use client"`（Client Component）：**

加state和effect：
```js
const [isLoggedIn, setIsLoggedIn] = useState(false);
useEffect(() => {
  fetch("/api/user/me").then(r => r.json()).then(({ user }) => setIsLoggedIn(!!user)).catch(() => {});
}, []);
```

- [ ] **Step 2: Build 验证**

```bash
npm run build
```

期望：通过。

- [ ] **Step 3: Commit**

```bash
git add app/Header.js
git commit -m "feat: Header 加用户登录状态导航"
```

---

## Task D：PWA 支持（最后做）

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `app/layout.js`

- [ ] **Step 1: 创建 public/manifest.json**

```json
{
  "name": "商镜Global — 企业订单增长诊断中心",
  "short_name": "商镜Global",
  "description": "免费诊断您的企业订单增长瓶颈",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a60a8",
  "lang": "zh-CN",
  "icons": [
    { "src": "/pwa-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: 创建 public/sw.js**

```js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
self.addEventListener("fetch", (event) => { event.respondWith(fetch(event.request)); });
```

- [ ] **Step 3: 准备图标**

在`public/`目录放：
- `pwa-192.png`（192×192 px，品牌logo，蓝色背景`#1a60a8`）
- `pwa-512.png`（512×512 px，同款）

可用squoosh.app或任意图片工具从现有logo生成。

- [ ] **Step 4: 修改 app/layout.js，加PWA meta标签**

在`<head>`内加：
```jsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1a60a8" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="商镜Global" />
```

在`<body>`末尾（`</body>`前）加：
```jsx
<script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
```

- [ ] **Step 5: Build 验证**

```bash
npm run build
```

期望：通过。

- [ ] **Step 6: Commit**

```bash
git add public/manifest.json public/sw.js public/pwa-192.png public/pwa-512.png app/layout.js
git commit -m "feat: PWA 支持（manifest + service worker + 图标）"
```

---

## 自检清单

- [x] SQLite → MySQL 完整迁移（5张表：leads/lead_activities/admin_credentials/users/user_diagnoses）
- [x] 所有lib函数改async，API路由全部await
- [x] 无新增外部认证库
- [x] 用户注册（邮箱+密码，注册成功显示恢复码）
- [x] 用户登录（30天session，独立Cookie与admin隔离）
- [x] 用户登出
- [x] 密码找回（邮箱+恢复码，无邮件服务）
- [x] 诊断历史自动保存（登录状态）
- [x] 账户页展示诊断历史
- [x] Header登录状态入口
- [x] PWA（安装到主屏幕）

## 环境变量（需老韩在服务器/Vercel配置）

```
MYSQL_HOST=<MySQL服务器地址>
MYSQL_PORT=3306
MYSQL_USER=<数据库用户>
MYSQL_PASSWORD=<数据库密码>
MYSQL_DATABASE=shangjing_global
```

其他变量（SESSION_SECRET、ADMIN_PASSWORD、ADMIN_RECOVERY_KEY、NEXT_PUBLIC_WHATSAPP_NUMBER）保持不变。
