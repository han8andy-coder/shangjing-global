import { NextResponse } from "next/server";
import {
  recoveryKeyMatches,
  resetAdminPassword,
  SESSION_COOKIE,
} from "../../../../lib/auth";

export const runtime = "nodejs";

const globalRecoveryLimit = globalThis;
const WINDOW_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function requestKey(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  );
}

function recordAttempt(request) {
  if (!globalRecoveryLimit.__shangjingRecoveryAttempts) {
    globalRecoveryLimit.__shangjingRecoveryAttempts = new Map();
  }
  const key = requestKey(request);
  const now = Date.now();
  const attempts = (
    globalRecoveryLimit.__shangjingRecoveryAttempts.get(key) || []
  ).filter((timestamp) => now - timestamp < WINDOW_MS);
  attempts.push(now);
  globalRecoveryLimit.__shangjingRecoveryAttempts.set(key, attempts);
  return attempts.length > MAX_ATTEMPTS;
}

export async function POST(request) {
  try {
    if (recordAttempt(request)) {
      return NextResponse.json(
        { ok: false, error: "重置尝试过多，请 30 分钟后再试。" },
        { status: 429 },
      );
    }

    const { recoveryKey, newPassword, confirmPassword } =
      await request.json();
    if (!recoveryKeyMatches(recoveryKey)) {
      return NextResponse.json(
        { ok: false, error: "恢复密钥不正确。" },
        { status: 401 },
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: "两次输入的新密码不一致。" },
        { status: 400 },
      );
    }

    const result = await resetAdminPassword(newPassword);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    globalRecoveryLimit.__shangjingRecoveryAttempts.delete(
      requestKey(request),
    );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Admin password recovery failed:", error);
    return NextResponse.json(
      { ok: false, error: "密码恢复功能尚未完成安全配置。" },
      { status: 500 },
    );
  }
}
