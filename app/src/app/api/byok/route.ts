import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("SUPABASE_URL or SUPABASE_SERVICE_KEY not set — BYOK cloud disabled");
}

async function upsertRow(wallet: string, payload: Record<string, any>) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase not configured on server");
  }
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/byok`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({ wallet, ...payload })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Supabase upsert failed: ${resp.status} ${txt}`);
  }
  // Supabase upsert may return empty body; safely handle it
  try {
    const txt = await resp.text();
    if (!txt) {
      return { ok: true };
    }
    return JSON.parse(txt);
  } catch {
    return { ok: true };
  }
}

function verifySignedRequest(params: {
  wallet: string;
  signature: string;
  message: string;
  timestamp: number;
}): { ok: boolean; error?: string } {
  const { wallet, signature, message, timestamp } = params;

  if (!wallet || !signature || !message) {
    return { ok: false, error: "missing fields" };
  }

  const ts = Number(timestamp || 0);
  if (Number.isNaN(ts) || Math.abs(Date.now() - ts) > 10 * 60 * 1000) {
    return { ok: false, error: "timestamp invalid or expired" };
  }

  const expectedMessage = `Strand BYOK authorization:${wallet}:${ts}`;
  if (message !== expectedMessage) {
    return { ok: false, error: "message format invalid" };
  }

  try {
    const msgBytes = new TextEncoder().encode(String(message));
    const sigBytes = Uint8Array.from(Buffer.from(String(signature), "base64"));
    const pubkeyBytes = bs58.decode(String(wallet));
    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes);
    if (!ok) {
      return { ok: false, error: "signature invalid" };
    }
  } catch {
    return { ok: false, error: "signature verification failed" };
  }

  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, provider, apiKey, baseUrl, model, signature, message, timestamp } = body;
    const verification = verifySignedRequest({
      wallet: String(wallet ?? ""),
      signature: String(signature ?? ""),
      message: String(message ?? ""),
      timestamp: Number(timestamp ?? 0)
    });
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error ?? "unauthorized" }, { status: 401 });
    }

    // store (apiKey kept as plain text in DB — recommend encrypting in production)
    const row = {
      provider: provider ?? null,
      api_key: apiKey ?? null,
      base_url: baseUrl ?? null,
      model: model ?? null,
      updated_at: new Date().toISOString()
    };

    await upsertRow(wallet, row);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/byok error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wallet = url.searchParams.get("wallet");
    const signature = url.searchParams.get("signature");
    const message = url.searchParams.get("message");
    const timestamp = Number(url.searchParams.get("timestamp") ?? "0");

    const verification = verifySignedRequest({
      wallet: String(wallet ?? ""),
      signature: String(signature ?? ""),
      message: String(message ?? ""),
      timestamp
    });
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error ?? "unauthorized" }, { status: 401 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/byok?wallet=eq.${encodeURIComponent(String(wallet ?? ""))}`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Supabase fetch failed: ${resp.status} ${txt}`);
    }
    const rows = await resp.json();
    return NextResponse.json({ row: rows[0] ?? null });
  } catch (err: any) {
    console.error("/api/byok GET error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const wallet = String(body?.wallet ?? "");
    const signature = String(body?.signature ?? "");
    const message = String(body?.message ?? "");
    const timestamp = Number(body?.timestamp ?? 0);

    const verification = verifySignedRequest({
      wallet,
      signature,
      message,
      timestamp
    });
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error ?? "unauthorized" }, { status: 401 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/byok?wallet=eq.${encodeURIComponent(wallet)}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Supabase delete failed: ${resp.status} ${txt}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/byok DELETE error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
