import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function supabaseHeaders(): Record<string, string> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase not configured on server");
  }

  return {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json"
  };
}

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const body = await req.json();
    const status = String(body?.status ?? "").trim().toLowerCase();

    if (!recordId) {
      return NextResponse.json({ error: "recordId is required" }, { status: 400 });
    }
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const extractionStatus = status === "approved" ? "verified" : "rejected";
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/worker_records?id=eq.${encodeURIComponent(recordId)}`,
      {
        method: "PATCH",
        headers: {
          ...supabaseHeaders(),
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          extraction_status: extractionStatus
        })
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Supabase patch failed: ${resp.status} ${txt}`);
    }

    const rows = await resp.json();
    return NextResponse.json({ ok: true, row: rows?.[0] ?? null });
  } catch (err: unknown) {
    console.error("/api/partner/approvals/[recordId] error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
