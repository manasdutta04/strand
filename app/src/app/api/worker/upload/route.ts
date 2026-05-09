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
  amountInr: number | null;
  deliveries: number | null;
  confidence: "high" | "medium" | "low";
  reason?: string;
} {
  if (!text || text.trim().length === 0) {
    return {
      amountInr: null,
      deliveries: null,
      confidence: "low",
      reason: "No extractable PDF text found."
    };
  }

  const singleSpaced = text.replace(/ {2,}/g, " ");
  const compact = singleSpaced.replace(/\s+/g, " ");
  console.log(
    `[PDF Extract Debug] Platform: ${platform}, Text length: ${text.length}, Compact length: ${compact.length}`
  );

  let amountInr: number | null = null;
  let deliveries: number | null = null;

  const explicitEarningsMatch = compact.match(
    /TOTAL\s+EARNINGS[\s\D]{0,120}(?:rs\.?|inr|₹|â‚¹)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i
  );
  const explicitDeliveriesMatch = compact.match(
    /TOTAL\s+(?:DELIVER(?:Y|IES)|ORDERS?|TRIPS?|RIDES?)[\s\D]{0,60}(\d{1,6})/i
  );

  if (explicitEarningsMatch) {
    amountInr = parseNumeric(explicitEarningsMatch[1]);
  }
  if (explicitDeliveriesMatch) {
    deliveries = parseNumeric(explicitDeliveriesMatch[1]);
  }

  if (amountInr === null) {
    const currencyPatterns = [
      /(?:rs\.?|inr|₹|â‚¹)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|\d{4,})/gi
    ];
    const amounts: number[] = [];
    for (const pattern of currencyPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(compact)) !== null) {
        const value = parseNumeric(match[1]);
        if (value !== null && value > 100) {
          amounts.push(value);
        }
      }
    }
    if (amounts.length > 0) {
      amountInr = Math.max(...amounts);
    }
  }

  if (deliveries === null) {
    const deliveryPatterns = [
      /\b(?:delivery|deliveries|order|orders|trip|trips|ride|rides)\D{0,20}(\d{1,6})\b/gi,
      /\b(\d{1,6})\D{0,20}(?:delivery|deliveries|order|orders|trip|trips|ride|rides)\b/gi
    ];
    const deliveryCounts: number[] = [];
    for (const pattern of deliveryPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(compact)) !== null) {
        const value = parseNumeric(match[1]);
        if (value !== null && value >= 1 && value <= 999999) {
          deliveryCounts.push(Math.trunc(value));
        }
      }
    }
    const standaloneTotals = compact.match(/\b(\d{2,6})\b/g) ?? [];
    for (const raw of standaloneTotals) {
      const value = parseNumeric(raw);
      if (value !== null && value >= 50 && value <= 999999) {
        deliveryCounts.push(Math.trunc(value));
      }
    }
    if (deliveryCounts.length > 0) {
      deliveryCounts.sort((a, b) => b - a);
      deliveries = deliveryCounts[0];
    }
  }

  const confidence: "high" | "medium" | "low" =
    amountInr !== null && deliveries !== null
      ? "high"
      : amountInr !== null || deliveries !== null
      ? "medium"
      : "low";

  const reason =
    confidence === "high"
      ? undefined
      : confidence === "medium"
      ? "Only one key metric extracted from statement."
      : "Could not reliably extract earnings and delivery totals.";

  console.log(
    `[PDF Extract] Platform: ${platform}, Amount INR: ${amountInr ?? "null"}, Deliveries: ${deliveries ?? "null"}, Confidence: ${confidence}`
  );

  return { amountInr, deliveries, confidence, reason };
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
        const pdfParseFn = (pdfParseModule?.default ?? pdfParseModule) as (
          input: Buffer
        ) => Promise<{ text?: string }>;
        const parsed = await pdfParseFn(buffer);
        text = String(parsed.text ?? "");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn("pdf parse failed", message);
      }
    }

    const { amountInr, deliveries, confidence, reason } = extractMetricsFromText(text, platform);
    const validationErrors: string[] = [];
    if (amountInr === null || amountInr <= 0) {
      validationErrors.push("Could not extract a valid earnings amount.");
    }
    if (deliveries === null || deliveries <= 0) {
      validationErrors.push("Could not extract a valid delivery/order/trip count.");
    }
    if (confidence === "low") {
      validationErrors.push("Extraction confidence is too low.");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          reason: confidence === "low" ? "extraction_failed" : "validation_failed",
          error: validationErrors.join(" "),
          details: {
            confidence,
            extractionReason: reason,
            textSnippet: text.slice(0, 500)
          }
        },
        { status: 422 }
      );
    }

    const inrToUsdRate = Number(
      process.env.INR_TO_USD_RATE ?? process.env.NEXT_PUBLIC_INR_TO_USD_RATE ?? "83"
    );
    const earningAmountUsdc = Number(((amountInr as number) / Math.max(1, inrToUsdRate)).toFixed(2));

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
        extraction_status: "pending",
        extracted_confidence: confidence,
        extraction_reason: reason ?? null,
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
  } catch (err: unknown) {
    console.error("/api/worker/upload error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, reason: "validation_failed", error: message },
      { status: 500 }
    );
  }
}
