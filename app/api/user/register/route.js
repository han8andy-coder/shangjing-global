import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerUser, createUserSessionToken, USER_SESSION_COOKIE } from "../../../../lib/user-auth";

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
