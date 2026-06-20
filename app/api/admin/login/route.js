import { NextResponse } from "next/server";
import {
  createSessionToken,
  passwordMatches,
  SESSION_COOKIE,
} from "../../../../lib/auth";

export const runtime = "nodejs";

const globalLoginLimit = globalThis;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function recordAttempt(request) {
  if (!globalLoginLimit.__shangjingLoginAttempts) {
    globalLoginLimit.__shangjingLoginAttempts = new Map();
  }
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const attempts = (
    globalLoginLimit.__shangjingLoginAttempts.get(key) || []
  ).filter((timestamp) => now - timestamp < WINDOW_MS);
  attempts.push(now);
  globalLoginLimit.__shangjingLoginAttempts.set(key, attempts);
  return attempts.length > MAX_ATTEMPTS;
}

function clearAttempts(request) {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  globalLoginLimit.__shangjingLoginAttempts?.delete(key);
}

export async function POST(request) {
  try {
    if (recordAttempt(request)) {
      return NextResponse.json(
        { ok: false, error: "登录尝试过多，请稍后再试。" },
        { status: 429 },
      );
    }

    const { password } = await request.json();
    if (!await passwordMatches(password)) {
      return NextResponse.json(
        { ok: false, error: "密码不正确。" },
        { status: 401 },
      );
    }

    clearAttempts(request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { ok: false, error: "后台尚未完成安全配置。" },
      { status: 500 },
    );
  }
}
