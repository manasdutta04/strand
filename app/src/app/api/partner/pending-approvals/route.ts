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

export async function GET(req: Request) {
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

    const records = await resp.json();

    // Map Supabase records to partner queue format
    const approvals = records
      .filter((record: any) => record.extraction_status !== "rejected") // Show all non-rejected
      .map((record: any, idx: number) => ({
        recordId: record.id,
        jobId: idx + 1, // use index as jobId for compatibility
        worker: record.wallet,
        amountUsdc: record.earning_amount_usdc,
        deliveryCount: record.delivery_count,
        platform: record.platform,
        confidence: record.extracted_confidence || "low",
        extractedText: record.extracted_text,
        createdAt: record.created_at,
        status: "pending" as const
      }))
      .slice(0, 20); // Limit to 20 for partner review

    return NextResponse.json({ ok: true, approvals });
  } catch (err: any) {
    console.error("/api/partner/pending-approvals error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
