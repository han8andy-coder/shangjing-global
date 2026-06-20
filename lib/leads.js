import crypto from "node:crypto";
import { getDatabase } from "./db";
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

export function createLead(lead) {
  const database = getDatabase();
  const id = crypto.randomUUID();
  const reference = createReference();
  const diagnosisScore = Number(lead.diagnosis?.score);
  const validDiagnosisScore =
    Number.isInteger(diagnosisScore) &&
    diagnosisScore >= 0 &&
    diagnosisScore <= 100
      ? diagnosisScore
      : null;

  const insertLead = database.prepare(`
    INSERT INTO leads (
      id, reference, name, contact, company, website, problem, language,
      source_page, referrer, utm_source, utm_medium, utm_campaign,
      diagnosis_score, diagnosis_label, diagnosis_title, diagnosis_answers
    ) VALUES (
      @id, @reference, @name, @contact, @company, @website, @problem, @language,
      @sourcePage, @referrer, @utmSource, @utmMedium, @utmCampaign,
      @diagnosisScore, @diagnosisLabel, @diagnosisTitle, @diagnosisAnswers
    )
  `);
  const insertActivity = database.prepare(`
    INSERT INTO lead_activities (lead_id, activity_type, note)
    VALUES (?, 'created', ?)
  `);

  database.transaction(() => {
    insertLead.run({
      id,
      reference,
      name: lead.name,
      contact: lead.contact,
      company: lead.company,
      website: lead.website || null,
      problem: lead.problem,
      language: lead.language,
      sourcePage: lead.sourcePage || null,
      referrer: lead.referrer || null,
      utmSource: lead.utmSource || null,
      utmMedium: lead.utmMedium || null,
      utmCampaign: lead.utmCampaign || null,
      diagnosisScore: validDiagnosisScore,
      diagnosisLabel: cleanText(lead.diagnosis?.label, 120) || null,
      diagnosisTitle: cleanText(lead.diagnosis?.title, 300) || null,
      diagnosisAnswers: lead.diagnosis?.answers
        ? JSON.stringify(lead.diagnosis.answers)
        : null,
    });
    insertActivity.run(
      id,
      lead.language === "en"
        ? "Lead submitted through the website."
        : "客户通过网站提交咨询。",
    );
  })();

  return { id, reference };
}

export function getDashboardData() {
  const database = getDatabase();
  const totals = database
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN date(created_at) = date('now', 'localtime') THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS last_seven_days,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won
      FROM leads
    `)
    .get();
  const byStatus = database
    .prepare("SELECT status, COUNT(*) AS count FROM leads GROUP BY status")
    .all();
  const recent = database
    .prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 8")
    .all();
  return { totals, byStatus, recent };
}

export function listLeads({ status = "", search = "" } = {}) {
  const database = getDatabase();
  const conditions = [];
  const params = {};

  if (status && isLeadStatus(status)) {
    conditions.push("status = @status");
    params.status = status;
  }
  if (search) {
    conditions.push(
      "(name LIKE @search OR company LIKE @search OR contact LIKE @search OR reference LIKE @search)",
    );
    params.search = `%${cleanText(search, 120)}%`;
  }

  return database
    .prepare(`
      SELECT *
      FROM leads
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      LIMIT 200
    `)
    .all(params);
}

export function getLead(id) {
  const database = getDatabase();
  const lead = database.prepare("SELECT * FROM leads WHERE id = ?").get(id);
  if (!lead) return null;
  const activities = database
    .prepare(
      "SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC",
    )
    .all(id);
  return { lead, activities };
}

export function updateLead(id, payload) {
  const database = getDatabase();
  const current = database.prepare("SELECT * FROM leads WHERE id = ?").get(id);
  if (!current) return null;

  const status = isLeadStatus(payload.status) ? payload.status : current.status;
  const owner = cleanText(payload.owner, 120) || null;
  const nextFollowUpAt = cleanText(payload.nextFollowUpAt, 40) || null;
  const note = cleanText(payload.note, 3000);

  database.transaction(() => {
    database
      .prepare(`
        UPDATE leads
        SET status = ?, owner = ?, next_follow_up_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(status, owner, nextFollowUpAt, id);

    if (status !== current.status) {
      database
        .prepare(`
          INSERT INTO lead_activities (lead_id, activity_type, note)
          VALUES (?, 'status', ?)
        `)
        .run(id, `状态从 ${current.status} 更新为 ${status}`);
    }
    if (note) {
      database
        .prepare(`
          INSERT INTO lead_activities (lead_id, activity_type, note)
          VALUES (?, 'note', ?)
        `)
        .run(id, note);
    }
  })();

  return getLead(id);
}
