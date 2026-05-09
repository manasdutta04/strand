import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

function parseNumeric(raw: string): number | null {
  const normalized = raw.replace(/,/g, "").trim();
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function extractMetricsFromText(text: string, platform: string): {
  amountInr: number;
  deliveries: number;
  confidence: "high" | "medium" | "low";
} {
  const compact = text.replace(/\s+/g, " ");

  const amountPatterns = [
    /(?:total\s+earnings?|earnings?|payout|amount\s+credited|net\s+pay)\D{0,30}(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi,
    /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi
  ];

  const deliveryPatterns = [
    /(?:deliver(?:y|ies)|orders?|trips?|rides?)\D{0,20}(\d{1,5})/gi,
    /(\d{1,5})\D{0,20}(?:deliver(?:y|ies)|orders?|trips?|rides?)/gi
  ];

  const amountCandidates: number[] = [];
  for (const pattern of amountPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(compact)) !== null) {
      const value = parseNumeric(match[1]);
      if (value !== null && value > 0) {
        amountCandidates.push(value);
      }
    }
  }

  const deliveryCandidates: number[] = [];
  for (const pattern of deliveryPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(compact)) !== null) {
      const value = parseNumeric(match[1]);
      if (value !== null && value >= 0) {
        deliveryCandidates.push(Math.trunc(value));
      }
    }
  }

  const fallbackByPlatform: Record<string, { amountInr: number; deliveries: number }> = {
    zomato: { amountInr: 2200, deliveries: 14 },
    swiggy: { amountInr: 2100, deliveries: 13 },
    blinkit: { amountInr: 1800, deliveries: 11 },
    ola: { amountInr: 2500, deliveries: 8 },
    uber: { amountInr: 2600, deliveries: 9 },
    urban_company: { amountInr: 3000, deliveries: 5 }
  };

  const fallback = fallbackByPlatform[platform] ?? { amountInr: 2000, deliveries: 10 };

  const amountInr = amountCandidates.length > 0 ? Math.max(...amountCandidates) : fallback.amountInr;
  const deliveries = deliveryCandidates.length > 0 ? Math.max(...deliveryCandidates) : fallback.deliveries;

  const confidence: "high" | "medium" | "low" =
    amountCandidates.length > 0 && deliveryCandidates.length > 0
      ? "high"
      : amountCandidates.length > 0 || deliveryCandidates.length > 0
      ? "medium"
      : "low";

  return { amountInr, deliveries, confidence };
}

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const form = await req.formData();
    const wallet = String(form.get("wallet") ?? "").trim();
    const platform = String(form.get("platform") ?? "").trim().toLowerCase();
    const file = form.get("file");

    if (!wallet || !platform) {
      return NextResponse.json({ error: "wallet and platform are required" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfParseModule = await import("pdf-parse");
        const pdfParseFn: any = pdfParseModule?.default ?? pdfParseModule;
        const parsed = await pdfParseFn(buffer);
        text = String(parsed.text ?? "");
      } catch (e) {
        console.warn("pdf parse failed", e);
        text = "";
      }
    }

    const { amountInr, deliveries, confidence } = extractMetricsFromText(text, platform);
    const inrToUsdRate = Number(process.env.INR_TO_USD_RATE ?? process.env.NEXT_PUBLIC_INR_TO_USD_RATE ?? "83");
    const earningAmountUsdc = Number((amountInr / Math.max(1, inrToUsdRate)).toFixed(2));

    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/worker_records`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        wallet,
        platform,
        file_name: file.name,
        earning_amount_usdc: earningAmountUsdc,
        delivery_count: deliveries,
        extracted_confidence: confidence,
        extracted_text: text.slice(0, 8000),
        created_at: new Date().toISOString()
      })
    });

    if (!insertResp.ok) {
      const txt = await insertResp.text();
      throw new Error(`worker_records insert failed: ${insertResp.status} ${txt}`);
    }

    const inserted = await insertResp.json();
    return NextResponse.json({ ok: true, row: inserted?.[0] ?? null });
  } catch (err: any) {
    console.error("/api/worker/upload error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
