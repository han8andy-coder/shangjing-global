import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/user-auth";
import { getDb } from "../../../../lib/db";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const { score, label, title, answers } = await request.json();
    if (typeof score !== "number" || !label || !title) {
      return NextResponse.json({ error: "数据格式不正确" }, { status: 400 });
    }
    const db = await getDb();
    await db.execute(
      "INSERT INTO user_diagnoses (user_id, score, label, title, answers) VALUES (?, ?, ?, ?, ?)",
      [user.id, score, label, title, JSON.stringify(answers || {})]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ diagnoses: [] }, { status: 401 });

  const db = await getDb();
  const [diagnoses] = await db.execute(
    "SELECT id, score, label, title, created_at FROM user_diagnoses WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [user.id]
  );
  return NextResponse.json({ diagnoses });
}
