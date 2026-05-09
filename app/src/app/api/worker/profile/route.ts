import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

type WorkerRecord = {
  id: string;
  wallet: string;
  platform: string;
  file_name: string;
  earning_amount_usdc: number;
  delivery_count: number;
  created_at: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateScore(records: WorkerRecord[]) {
  if (records.length === 0) {
    return {
      scoreComponents: null,
      totalScore: 0
    };
  }

  const totalDeliveries = records.reduce((sum, row) => sum + Number(row.delivery_count || 0), 0);
  const totalEarnings = records.reduce((sum, row) => sum + Number(row.earning_amount_usdc || 0), 0);

  const earliestTs = Math.min(...records.map((row) => new Date(row.created_at).getTime()));
  const daysActive = Math.max(1, Math.floor((Date.now() - earliestTs) / (1000 * 60 * 60 * 24)) + 1);

  const platforms = new Set(records.map((row) => row.platform));

  const avgEarnings = totalEarnings / Math.max(1, records.length);
  const variance =
    records.reduce((sum, row) => {
      const diff = Number(row.earning_amount_usdc || 0) - avgEarnings;
      return sum + diff * diff;
    }, 0) / Math.max(1, records.length);
  const stdDev = Math.sqrt(variance);
  const cv = avgEarnings > 0 ? stdDev / avgEarnings : 1;

  const delivery_volume = clamp(Math.round((totalDeliveries / 200) * 200), 0, 200);
  const earnings_consistency = clamp(Math.round((1 - Math.min(cv, 1)) * 150), 0, 150);
  const tenure = clamp(Math.round((Math.min(daysActive, 365) / 365) * 150), 0, 150);
  const rating_points = clamp(120 + Math.round(Math.min(records.length, 40) * 2), 0, 200);
  const cross_platform = clamp(platforms.size * 30, 0, 150);
  const repayment = 0;

  const totalScore =
    delivery_volume +
    earnings_consistency +
    tenure +
    rating_points +
    cross_platform +
    repayment;

  return {
    scoreComponents: {
      delivery_volume,
      earnings_consistency,
      tenure,
      rating_points,
      cross_platform,
      repayment
    },
    totalScore
  };
}

export async function GET(req: Request) {
  try {
    const wallet = new URL(req.url).searchParams.get("wallet")?.trim() ?? "";
    if (!wallet) {
      return NextResponse.json({ error: "wallet is required" }, { status: 400 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/worker_records?wallet=eq.${encodeURIComponent(wallet)}&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      // If table doesn't exist yet, return empty records instead of error
      if (resp.status === 404 && txt.includes("PGRST205")) {
        console.warn("worker_records table not created yet; returning empty profile");
        return NextResponse.json({
          workRecords: [],
          scoreComponents: null,
          totalScore: 0
        });
      }
      throw new Error(`worker_records fetch failed: ${resp.status} ${txt}`);
    }

    const records = (await resp.json()) as WorkerRecord[];
    const { scoreComponents, totalScore } = calculateScore(records);

    return NextResponse.json({
      workRecords: records,
      scoreComponents,
      totalScore
    });
  } catch (err: any) {
    console.error("/api/worker/profile error", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
