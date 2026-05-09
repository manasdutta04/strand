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

async function extractPdfText(buffer: Buffer): Promise<{ text: string; parseError: string | null }> {
  const errors: string[] = [];

  const tryParse = async (
    factory: () => Promise<{
      getText: () => Promise<{ text?: string }>;
      destroy: () => Promise<void>;
    }>
  ): Promise<string | null> => {
    try {
      const parser = await factory();
      const parsed = await parser.getText();
      await parser.destroy();
      return String(parsed.text ?? "");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      return null;
    }
  };

  // Attempt 1: root export.
  const rootText = await tryParse(async () => {
    const mod = (await import("pdf-parse")) as {
      PDFParse?: new (args: { data: Buffer }) => {
        getText: () => Promise<{ text?: string }>;
        destroy: () => Promise<void>;
      };
      default?: {
        PDFParse?: new (args: { data: Buffer }) => {
          getText: () => Promise<{ text?: string }>;
          destroy: () => Promise<void>;
        };
      };
    };
    const Ctor = mod.PDFParse ?? mod.default?.PDFParse;
    if (!Ctor) {
      throw new Error("PDFParse export not found in root export.");
    }
    return new Ctor({ data: buffer });
  });
  if (rootText !== null) {
    return { text: rootText, parseError: null };
  }

  // Attempt 2: runtime require fallback.
  try {
    const runtimeRequire = eval("require") as unknown as NodeRequire;
    const mod = runtimeRequire("pdf-parse") as {
      PDFParse?: new (args: { data: Buffer }) => {
        getText: () => Promise<{ text?: string }>;
        destroy: () => Promise<void>;
      };
      default?: {
        PDFParse?: new (args: { data: Buffer }) => {
          getText: () => Promise<{ text?: string }>;
          destroy: () => Promise<void>;
        };
      };
    };
    const Ctor = mod.PDFParse ?? mod.default?.PDFParse;
    if (!Ctor) {
      throw new Error("PDFParse export not found in runtime require fallback.");
    }
    const parser = new Ctor({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return { text: String(parsed.text ?? ""), parseError: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    const parseError = errors.join(" | ");
    console.warn("pdf parse failed", parseError);
    return { text: "", parseError };
  }
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

  const compact = text.replace(/ {2,}/g, " ").replace(/\s+/g, " ");
  console.log(
    `[PDF Extract Debug] platform=${platform} textLength=${text.length} compactLength=${compact.length}`
  );

  let amountInr: number | null = null;
  let deliveries: number | null = null;
  const earningsCandidates: number[] = [];
  const deliveriesCandidates: number[] = [];

  const earningsPatterns = [
    /TOTAL\s+EARNINGS[\s\S]{0,140}(?:₹|â‚¹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi,
    /TOTAL[\s\S]{0,140}(?:₹|â‚¹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi,
    /(?:₹|â‚¹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.\d{1,2})?)/gi
  ];
  for (const pattern of earningsPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(compact)) !== null) {
      const value = parseNumeric(match[1]);
      if (value !== null && value > 100) {
        earningsCandidates.push(value);
      }
    }
  }

  const deliveryPatterns = [
    /based\s+on\s+([0-9][0-9,]*)\s+(?:orders?|deliver(?:y|ies)|trips?|rides?)/gi,
    /([0-9][0-9,]*)\s+total\s+deliver(?:y|ies)/gi,
    /total\s+deliver(?:y|ies)\D{0,30}([0-9][0-9,]*)/gi,
    /total\s+orders?\D{0,30}([0-9][0-9,]*)/gi
  ];
  for (const pattern of deliveryPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(compact)) !== null) {
      const value = parseNumeric(match[1]);
      if (value !== null && value >= 1 && value <= 999999) {
        deliveriesCandidates.push(Math.trunc(value));
      }
    }
  }

  if (earningsCandidates.length > 0) {
    amountInr = Math.max(...earningsCandidates);
  }
  if (deliveriesCandidates.length > 0) {
    deliveries = Math.max(...deliveriesCandidates);
  }

  if (deliveries === null) {
    const loosePatterns = [
      /\b(?:delivery|deliveries|order|orders|trip|trips|ride|rides)\D{0,20}([0-9][0-9,]*)\b/gi,
      /\b([0-9][0-9,]*)\D{0,20}(?:delivery|deliveries|order|orders|trip|trips|ride|rides)\b/gi
    ];
    const loose: number[] = [];
    for (const pattern of loosePatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(compact)) !== null) {
        const value = parseNumeric(match[1]);
        if (value !== null && value >= 1 && value <= 999999) {
          loose.push(Math.trunc(value));
        }
      }
    }
    if (loose.length > 0) {
      deliveries = Math.max(...loose);
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
    `[PDF Extract] platform=${platform} amountInr=${amountInr ?? "null"} deliveries=${deliveries ?? "null"} confidence=${confidence}`
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
    let parseError: string | null = null;
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const parsed = await extractPdfText(buffer);
      text = parsed.text;
      parseError = parsed.parseError;
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
            parseError,
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

    const basePayload = {
      wallet,
      platform,
      file_name: file.name,
      earning_amount_usdc: earningAmountUsdc,
      delivery_count: deliveries,
      extracted_confidence: confidence,
      extracted_text: text.slice(0, 8000),
      created_at: new Date().toISOString()
    };
    const extendedPayload = {
      ...basePayload,
      extraction_status: "pending",
      extraction_reason: reason ?? null
    };

    let insertResp = await fetch(`${SUPABASE_URL}/rest/v1/worker_records`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=representation"
      },
      body: JSON.stringify(extendedPayload)
    });

    if (!insertResp.ok) {
      const firstErrorText = await insertResp.text();
      const missingColumn =
        insertResp.status === 400 &&
        (firstErrorText.includes("PGRST204") ||
          firstErrorText.includes("extraction_reason") ||
          firstErrorText.includes("extraction_status"));

      if (missingColumn) {
        insertResp = await fetch(`${SUPABASE_URL}/rest/v1/worker_records`, {
          method: "POST",
          headers: {
            ...supabaseHeaders(),
            Prefer: "return=representation"
          },
          body: JSON.stringify(basePayload)
        });
      } else {
        throw new Error(`worker_records insert failed: ${insertResp.status} ${firstErrorText}`);
      }
    }

    if (!insertResp.ok) {
      const txt = await insertResp.text();
      throw new Error(`worker_records insert failed: ${insertResp.status} ${txt}`);
    }

    const inserted = await insertResp.json();
    return NextResponse.json({ ok: true, row: inserted?.[0] ?? null });
  } catch (err: unknown) {
    console.error("/api/worker/upload error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, reason: "validation_failed", error: message }, { status: 500 });
  }
}
