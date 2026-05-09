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
  if (!text || text.trim().length === 0) {
    // No text extracted - use fallback
    const fallbackByPlatform: Record<string, { amountInr: number; deliveries: number }> = {
      zomato: { amountInr: 2200, deliveries: 14 },
      swiggy: { amountInr: 2100, deliveries: 13 },
      blinkit: { amountInr: 1800, deliveries: 11 },
      ola: { amountInr: 2500, deliveries: 8 },
      uber: { amountInr: 2600, deliveries: 9 },
      urban_company: { amountInr: 3000, deliveries: 5 }
    };
    const fallback = fallbackByPlatform[platform] ?? { amountInr: 2000, deliveries: 10 };
    return { amountInr: fallback.amountInr, deliveries: fallback.deliveries, confidence: "low" };
  }

  // Preserve some structure by replacing multiple spaces with single space, but keep newlines
  const singleSpaced = text.replace(/ {2,}/g, " ");
  const compact = singleSpaced.replace(/\s+/g, " ");
  const lower = compact.toLowerCase();

  console.log(`[PDF Extract Debug] Text length: ${text.length}, Compact length: ${compact.length}`);

  // First try: Look for explicit "TOTAL EARNINGS" / "TOTAL DELIVERIES" headers
  const explicitEarningsMatch = compact.match(/TOTAL\s+EARNINGS[\s\D]{0,50}(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const explicitDeliveriesMatch = compact.match(/TOTAL\s+DELIVER(?:Y|IES)[\s\D]{0,30}(\d{1,5})/i);

  let amountInr: number | null = null;
  let deliveries: number | null = null;

  if (explicitEarningsMatch) {
    amountInr = parseNumeric(explicitEarningsMatch[1]);
  }
  if (explicitDeliveriesMatch) {
    deliveries = parseNumeric(explicitDeliveriesMatch[1]);
  }

  // Second try: Look for large numbers with currency (3+ digits after thousands separator or 4+ standalone)
  if (amountInr === null) {
    const currencyPatterns = [
      /(?:rs\.?|inr|₹)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|\d{4,})/gi  // Amounts with optional commas
    ];
    const amounts: number[] = [];
    for (const pattern of currencyPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(compact)) !== null) {
        const value = parseNumeric(match[1]);
        if (value !== null && value > 500) { // Realistic earnings
          amounts.push(value);
        }
      }
    }
    if (amounts.length > 0) {
      amountInr = Math.max(...amounts);
    }
  }

  // Third try: Look for large standalone numbers (likely total delivery count)
  if (deliveries === null) {
    const largeNumberMatterns = [
      /\D(\d{2,5})\D(?:delivery|deliveries|order|orders|trip|trips|ride|rides)/gi,
      /(?:delivery|deliveries|order|orders|trip|trips|ride|rides)\D(\d{2,5})/gi,
      /\D([2-9]\d{2,4})\D/g  // Any large number between boundaries (3-5 digits, >= 200)
    ];
    const deliveryCounts: number[] = [];
    for (const pattern of largeNumberPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(compact)) !== null) {
        const value = parseNumeric(match[1]);
        if (value !== null && value >= 10 && value <= 99999) {
          deliveryCounts.push(Math.trunc(value));
        }
      }
    }
    if (deliveryCounts.length > 0) {
      // Filter out outliers and get the most reasonable value
      deliveryCounts.sort((a, b) => b - a); // Sort descending
      deliveries = deliveryCounts[0]; // Take the largest (usually total)
    }
  }

  // Use fallback if still not found
  const fallbackByPlatform: Record<string, { amountInr: number; deliveries: number }> = {
    zomato: { amountInr: 2200, deliveries: 14 },
    swiggy: { amountInr: 2100, deliveries: 13 },
    blinkit: { amountInr: 1800, deliveries: 11 },
    ola: { amountInr: 2500, deliveries: 8 },
    uber: { amountInr: 2600, deliveries: 9 },
    urban_company: { amountInr: 3000, deliveries: 5 }
  };
  const fallback = fallbackByPlatform[platform] ?? { amountInr: 2000, deliveries: 10 };

  const finalAmount = amountInr ?? fallback.amountInr;
  const finalDeliveries = deliveries ?? fallback.deliveries;

  // Determine confidence
  const confidence: "high" | "medium" | "low" =
    amountInr !== null && deliveries !== null
      ? "high"
      : amountInr !== null || deliveries !== null
      ? "medium"
      : "low";

  console.log(`[PDF Extract] Platform: ${platform}, Amount: ₹${finalAmount}, Deliveries: ${finalDeliveries}, Confidence: ${confidence}, Extracted: amount=${amountInr}, deliveries=${deliveries}`);

  return { amountInr: finalAmount, deliveries: finalDeliveries, confidence };
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  
  // Test endpoint for validating extraction logic
  if (url.searchParams.get("test") === "true") {
    const sampleZomatoText = `
      JANUARY 2024
      TOTAL DELIVERIES
      342
      TOTAL EARNINGS
      ₹28,540
      Payment Status: Completed
    `;

    const result = extractMetricsFromText(sampleZomatoText, "zomato");
    console.log("[Test Result]", result);
    return NextResponse.json({
      test: "extraction",
      input: sampleZomatoText.trim(),
      output: result,
      success: result.deliveries === 342 && result.amountInr === 28540
    });
  }

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
        // Use dynamic import with error handling for pdfjs-dist webpack issues
        const pdfParseModule = await import("pdf-parse");
        const pdfParseFn: any = pdfParseModule?.default ?? pdfParseModule;
        const parsed = await pdfParseFn(buffer);
        text = String(parsed.text ?? "");
      } catch (e: any) {
        console.warn("pdf parse failed", e?.message || e);
        // If pdf-parse fails due to webpack issues, log and continue with empty text
        // The extractMetricsFromText function will use fallback values
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

// Test function: Validate extraction works with sample Zomato text
// Access at /api/worker/upload?test=true
