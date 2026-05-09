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

type WorkerRecordRow = {
  id: string;
  wallet: string;
  earning_amount_usdc: number;
  delivery_count: number;
  platform: string;
  extracted_confidence?: "high" | "medium" | "low";
  extraction_status?: "pending" | "verified" | "failed" | "rejected";
  extraction_reason?: string | null;
  extracted_text?: string | null;
  created_at: string;
};

export async function GET() {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Fetch pending worker records from Supabase
    // Records are pending if they have been extracted by AI but not yet approved by partner
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/worker_records?order=created_at.desc&limit=50`,
      {
        method: "GET",
        headers: supabaseHeaders()
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Supabase fetch failed: ${resp.status} ${txt}`);
    }

    const records = (await resp.json()) as WorkerRecordRow[];

    const approvals = records
      .filter((record) => {
        const status = record.extraction_status ?? "pending";
        const validMetrics =
          Number(record.earning_amount_usdc || 0) > 0 && Number(record.delivery_count || 0) > 0;
        return (status === "pending" || status === "verified") && validMetrics;
      })
      .map((record) => ({
        recordId: record.id,
        worker: record.wallet,
        amountUsdc: record.earning_amount_usdc,
        deliveryCount: record.delivery_count,
        platform: record.platform,
        confidence: record.extracted_confidence || "low",
        extractionStatus: record.extraction_status ?? "pending",
        extractionReason: record.extraction_reason ?? null,
        createdAt: record.created_at,
        status: record.extraction_status === "verified" ? "approved" : "pending"
      }))
      .slice(0, 50);

    return NextResponse.json({ ok: true, approvals });
  } catch (err: unknown) {
    console.error("/api/partner/pending-approvals error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
