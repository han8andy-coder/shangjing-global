import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../../lib/auth";
import { getLead, updateLead } from "../../../../../lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const result = await getLead(id);
  if (!result) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...result });
}

export async function PATCH(request, { params }) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const payload = await request.json();
  const result = await updateLead(id, payload);
  if (!result) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...result });
}
