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
