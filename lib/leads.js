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
