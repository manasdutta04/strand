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
  extraction_status?: "pending" | "verified" | "failed" | "rejected";
  extracted_confidence?: "high" | "medium" | "low";
  extraction_reason?: string | null;
};

function isTrustedRecord(row: WorkerRecord): boolean {
  const earnings = Number(row.earning_amount_usdc || 0);
  const deliveries = Number(row.delivery_count || 0);
  if (earnings <= 0 || deliveries <= 0) {
    return false;
  }

  const confidence = row.extracted_confidence;
  if (confidence === "high" || confidence === "medium") {
    return true;
  }

  // Backward-compat: if confidence metadata is missing, keep clearly real rows.
  // This excludes legacy fallback-looking data like 14 trips / $26.
  return earnings >= 100 || deliveries >= 50;
}

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

function deriveSkills(records: WorkerRecord[]) {
  const byPlatform = new Map<string, { trips: number; earnings: number }>();
  for (const record of records) {
    const curr = byPlatform.get(record.platform) ?? { trips: 0, earnings: 0 };
    curr.trips += Number(record.delivery_count || 0);
    curr.earnings += Number(record.earning_amount_usdc || 0);
    byPlatform.set(record.platform, curr);
  }

  return Array.from(byPlatform.entries())
    .map(([platform, stats]) => ({
      name: `${platform.replace(/_/g, " ")} operations`,
      confidence: clamp(Math.round(Math.min(stats.trips * 2 + stats.earnings, 100)), 1, 100)
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

function deriveCreditSummary(totalScore: number, records: WorkerRecord[]) {
  const totalEarnings = records.reduce((sum, row) => sum + Number(row.earning_amount_usdc || 0), 0);
  const eligible = totalScore >= 400;
  const maxUsdc = eligible ? Math.round(Math.max(200, totalEarnings * 0.35)) : 0;
  return {
    eligible,
    maxUsdc,
    apr: eligible ? Number((24 - Math.min(12, totalScore / 1000) * 12).toFixed(1)) : null,
    borrowedUsdc: 0
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
      `${SUPABASE_URL}/rest/v1/worker_records?wallet=eq.${encodeURIComponent(
        wallet
      )}&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 404 && txt.includes("PGRST205")) {
        return NextResponse.json({
          workRecords: [],
          scoreComponents: null,
          totalScore: 0,
          skills: [],
          creditSummary: { eligible: false, maxUsdc: 0, apr: null, borrowedUsdc: 0 }
        });
      }
      throw new Error(`worker_records fetch failed: ${resp.status} ${txt}`);
    }

    const allRecords = (await resp.json()) as WorkerRecord[];
    const usableRecords = allRecords.filter(
      (row) => row.extraction_status !== "rejected" && row.extraction_status !== "failed"
    );
    const trustedRecords = usableRecords.filter(isTrustedRecord);
    const scoringRecords = trustedRecords;
    const { scoreComponents, totalScore } = calculateScore(scoringRecords);
    const skills = deriveSkills(scoringRecords);
    const creditSummary = deriveCreditSummary(totalScore, scoringRecords);

    return NextResponse.json({
      workRecords: trustedRecords,
      scoreComponents,
      totalScore,
      skills,
      creditSummary
    });
  } catch (err: unknown) {
    console.error("/api/worker/profile error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
