"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ScoreBreakdown } from "../../../components/ScoreBreakdown";
import { WorkRecordsDisplay, type WorkRecord } from "../../../components/WorkRecordsDisplay";
import type { ScoreComponents } from "../../../components/ScoreBreakdown";

function truncateWallet(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

type ProfilePayload = {
  workRecords: WorkRecord[];
  scoreComponents: ScoreComponents | null;
  totalScore: number;
};

export default function ProfileClient({ wallet }: { wallet: string }) {
  const [data, setData] = useState<ProfilePayload>({
    workRecords: [],
    scoreComponents: null,
    totalScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await fetch(`/api/worker/profile?wallet=${encodeURIComponent(wallet)}`);
        const payload = (await resp.json()) as ProfilePayload;
        if (!cancelled && resp.ok) {
          setData({
            workRecords: payload.workRecords ?? [],
            scoreComponents: payload.scoreComponents ?? null,
            totalScore: payload.totalScore ?? 0
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const totalEarningsInr = useMemo(
    () => Math.round(data.workRecords.reduce((sum, r) => sum + r.earning_amount_usdc, 0) * 83),
    [data.workRecords]
  );
  const totalDeliveries = useMemo(
    () => data.workRecords.reduce((sum, r) => sum + r.delivery_count, 0),
    [data.workRecords]
  );
  const platformCount = useMemo(
    () => new Set(data.workRecords.map((r) => r.platform)).size,
    [data.workRecords]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
        <div>
          <div className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Public profile</div>
          <h1 className="font-grotesk mt-2 text-2xl font-semibold tracking-tight text-[#EFF4FF]">{truncateWallet(wallet)}</h1>
          <p className="font-mono mt-1 text-sm text-[#EFF4FF]/75">Live profile from verified records</p>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-[#EFF4FF]/75 font-mono">
          Strand Score {data.totalScore}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Total Earnings</CardTitle></CardHeader><CardContent><div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">₹{totalEarningsInr.toLocaleString()}</div><p className="font-mono text-sm text-[#EFF4FF]/75">INR</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Deliveries</CardTitle></CardHeader><CardContent><div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">{totalDeliveries.toLocaleString()}</div><p className="font-mono text-sm text-[#EFF4FF]/75">{data.workRecords.length} records</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Platforms</CardTitle></CardHeader><CardContent><div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">{platformCount}</div><p className="font-mono text-sm text-[#EFF4FF]/75">Active</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Credit Readiness</CardTitle></CardHeader><CardContent><div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">{data.totalScore >= 400 ? "Yes" : "No"}</div><p className="font-mono text-sm text-[#EFF4FF]/75">{data.totalScore >= 400 ? "Eligible" : "Build score"}</p></CardContent></Card>
      </section>

      <section>{data.scoreComponents ? <ScoreBreakdown components={data.scoreComponents} totalScore={data.totalScore} inrRate={83} /> : <Card><CardContent className="py-8 text-center font-mono text-sm text-[#EFF4FF]/75">{loading ? "Loading..." : "No score yet."}</CardContent></Card>}</section>
      <section><h2 className="mb-3 text-xl font-semibold">Work history</h2><WorkRecordsDisplay records={data.workRecords} inrRate={83} isLoading={loading} /></section>
    </main>
  );
}
