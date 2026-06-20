import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "./db";

export const SESSION_COOKIE = "sjg_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function hashPassword(password, salt) {
  return crypto
    .scryptSync(String(password), salt, 64)
    .toString("base64url");
}

function validateNewPassword(password) {
  const value = String(password || "");
  if (value.length < 12) {
    return "新密码至少需要 12 个字符。";
  }
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return "新密码必须同时包含字母和数字。";
  }
  return "";
}

function getCredential() {
  const database = getDatabase();
  let credential = database
    .prepare("SELECT * FROM admin_credentials WHERE id = 1")
    .get();

  if (!credential) {
    const initialPassword = process.env.ADMIN_PASSWORD;
    const passwordError = validateNewPassword(initialPassword);
    if (passwordError) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 12 characters, letters and numbers.",
      );
    }
    const salt = crypto.randomBytes(24).toString("base64url");
    database
      .prepare(`
        INSERT INTO admin_credentials (
          id, password_hash, password_salt, session_version
        ) VALUES (1, ?, ?, 1)
      `)
      .run(hashPassword(initialPassword, salt), salt);
    credential = database
      .prepare("SELECT * FROM admin_credentials WHERE id = 1")
      .get();
  }

  return credential;
}

export function passwordMatches(password) {
  const credential = getCredential();
  return safeEqual(
    hashPassword(password, credential.password_salt),
    credential.password_hash,
  );
}

export function recoveryKeyMatches(recoveryKey) {
  const expected = process.env.ADMIN_RECOVERY_KEY;
  if (!expected || expected.length < 20) {
    throw new Error(
      "ADMIN_RECOVERY_KEY must contain at least 20 characters.",
    );
  }
  return safeEqual(String(recoveryKey || ""), expected);
}

export function resetAdminPassword(newPassword) {
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  const database = getDatabase();
  getCredential();
  const salt = crypto.randomBytes(24).toString("base64url");
  database
    .prepare(`
      UPDATE admin_credentials
      SET password_hash = ?, password_salt = ?,
          session_version = session_version + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)
    .run(hashPassword(newPassword, salt), salt);
  return { ok: true };
}

export function createSessionToken() {
  const credential = getCredential();
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      version: credential.session_version,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return (
      parsed.role === "admin" &&
      parsed.version === getCredential().session_version &&
      Number.isFinite(parsed.expiresAt) &&
      parsed.expiresAt > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function isAdminRequest(request) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireAdminPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)) {
    redirect("/admin/login");
  }
}
