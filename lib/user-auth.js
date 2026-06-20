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
