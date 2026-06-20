import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginUser, createUserSessionToken, USER_SESSION_COOKIE } from "../../../../lib/user-auth";

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
