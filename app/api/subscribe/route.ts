import { NextResponse } from "next/server";
import { adminMessaging } from "@/lib/admin";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  if (!body || !body.token || !Array.isArray(body.topics)) return NextResponse.json({ error: "token + topics required" }, { status: 400 });
  try {
    for (const t of body.topics) await adminMessaging.subscribeToTopic(body.token, t);
    return NextResponse.json({ ok: true });
  } catch (e:any) { return NextResponse.json({ error: e?.message || "failed" }, { status: 500 }); }
}
