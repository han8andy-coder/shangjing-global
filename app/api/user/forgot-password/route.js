import { NextResponse } from "next/server";
import { resetPasswordWithRecoveryCode } from "../../../../lib/user-auth";

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
