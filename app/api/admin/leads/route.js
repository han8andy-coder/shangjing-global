import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/auth";
import { listLeads } from "../../../../lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(request.url);
  const leads = listLeads({
    status: url.searchParams.get("status") || "",
    search: url.searchParams.get("search") || "",
  });
  return NextResponse.json({ ok: true, leads });
}
