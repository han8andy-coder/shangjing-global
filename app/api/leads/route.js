import { NextResponse } from "next/server";
import { createLead, validateLeadPayload } from "../../../lib/leads";

export const runtime = "nodejs";

const globalRateLimit = globalThis;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function isRateLimited(request) {
  if (!globalRateLimit.__shangjingLeadRateLimit) {
    globalRateLimit.__shangjingLeadRateLimit = new Map();
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (
    globalRateLimit.__shangjingLeadRateLimit.get(key) || []
  ).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  globalRateLimit.__shangjingLeadRateLimit.set(key, recent);
  return recent.length > MAX_SUBMISSIONS;
}

export async function POST(request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json(
        { ok: false, error: "提交次数过多，请稍后再试。" },
        { status: 429 },
      );
    }

    const payload = await request.json();
    const validation = validateLeadPayload(payload);

    if (validation.silent) {
      return NextResponse.json({ ok: true, reference: "SJG-RECEIVED" });
    }
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: 400 },
      );
    }

    const result = createLead(validation.lead);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json(
      { ok: false, error: "暂时无法保存，请通过 WhatsApp 联系我们。" },
      { status: 500 },
    );
  }
}
