"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ScoreBreakdown } from "../../../components/ScoreBreakdown";
import { WorkRecordsDisplay, type WorkRecord } from "../../../components/WorkRecordsDisplay";
import type { ScoreComponents } from "../../../components/ScoreBreakdown";

function truncateWallet(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function ProfileClient({ wallet }: { wallet: string }) {
  const demoProfile = useMemo(() => {
    const seed = wallet.length;
    const records: WorkRecord[] = [
      {
        id: `${wallet.slice(0, 6)}-1`,
        earning_amount_usdc: 142.5,
        delivery_count: 38,
        platform: "zomato",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${wallet.slice(0, 6)}-2`,
        earning_amount_usdc: 128.2,
        delivery_count: 34,
        platform: "swiggy",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `${wallet.slice(0, 6)}-3`,
        earning_amount_usdc: 118.4,
        delivery_count: 29,
        platform: "blinkit",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const components: ScoreComponents = {
      delivery_volume: 118,
      earnings_consistency: 128,
      tenure: 74,
      rating_points: 164,
      cross_platform: 90,
      repayment: seed % 2 === 0 ? 30 : 0
    };

    const totalScore = Object.values(components).reduce((sum, value) => sum + value, 0);

    return {
      records,
      components,
      totalScore,
      tier: totalScore >= 800 ? "Trusted" : totalScore >= 600 ? "Established" : totalScore >= 400 ? "Building" : "Starter"
    };
  }, [wallet]);

  const totalEarnings = demoProfile.records.reduce((sum, record) => sum + record.earning_amount_usdc, 0);
  const totalDeliveries = demoProfile.records.reduce((sum, record) => sum + record.delivery_count, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
        <div>
          <div className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Public profile</div>
          <h1 className="font-grotesk mt-2 text-2xl font-semibold tracking-tight text-[#EFF4FF]">{truncateWallet(wallet)}</h1>
          <p className="font-mono mt-1 text-sm text-[#EFF4FF]/75">Portable gig work history on Solana</p>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-[#EFF4FF]/75 font-mono">
          Strand Score {demoProfile.totalScore} • {demoProfile.tier}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">${totalEarnings.toLocaleString()}</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">₹{Math.round(totalEarnings * 83).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">{totalDeliveries.toLocaleString()}</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">Across 3 platform records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">3</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">Zomato, Swiggy, Blinkit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-grotesk text-xs uppercase tracking-wide text-[#EFF4FF]/60">Credit Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-grotesk text-2xl font-semibold text-[#EFF4FF]">{demoProfile.totalScore >= 400 ? "Yes" : "No"}</div>
            <p className="font-mono text-sm text-[#EFF4FF]/75">
              {demoProfile.totalScore >= 400 ? "Eligible for credit" : "Needs higher score"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <ScoreBreakdown components={demoProfile.components} totalScore={demoProfile.totalScore} inrRate={83} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Work history</h2>
        <WorkRecordsDisplay records={demoProfile.records} inrRate={83} />
      </section>

      <section className="panel p-5 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
        <h2 className="font-grotesk mb-3 text-xl font-semibold text-[#EFF4FF]">About this profile</h2>
        <p className="font-mono text-sm text-[#EFF4FF]/75">
          This shareable public profile shows verified gig work history, Strand Score, and credit readiness.
          It is designed for Indian delivery and mobility workers who need portable reputation across platforms.
        </p>
      </section>
    </main>
  );
}
