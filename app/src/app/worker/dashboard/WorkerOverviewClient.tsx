"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { ScoreBreakdown } from "../../../components/ScoreBreakdown";
import { EarningsUpload } from "../../../components/EarningsUpload";
import { WorkRecordsDisplay } from "../../../components/WorkRecordsDisplay";
import { useWorkerProfile } from "../../../hooks/useWorkerProfile";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

const PLATFORMS = [
  { name: "zomato", label: "Zomato" },
  { name: "swiggy", label: "Swiggy" },
  { name: "blinkit", label: "Blinkit" },
  { name: "ola", label: "Ola" },
  { name: "uber", label: "Uber" },
  { name: "urban_company", label: "Urban Company" }
];

const INR_TO_USD_RATE = parseInt(process.env.NEXT_PUBLIC_INR_TO_USD_RATE || "83", 10);

export default function WorkerOverviewClient({ initialDemoMode }: { initialDemoMode: boolean }) {
  const { publicKey } = useWallet();
  const [demoMode] = useState(initialDemoMode);
  const [refreshToken, setRefreshToken] = useState(0);
  const wallet = publicKey?.toBase58() ?? null;
  const { workRecords, scoreComponents, totalScore, isLoading, error } = useWorkerProfile(
    wallet,
    demoMode,
    refreshToken
  );
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].name);

  const shouldRequireWallet = !demoMode;
  const eligibleCredit = totalScore >= 400;
  const estimatedCredit = eligibleCredit ? Math.max(0, (totalScore - 400) * 10) : 0;

  const content = (
    <SaasShell
      productLabel={demoMode ? "Worker Workspace · Demo" : "Worker Workspace"}
      title="Dashboard"
      subtitle={demoMode ? "Demo data. No wallet needed." : "Track earnings and unlock credit."}
      nav={NAV}
    >
      {demoMode && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#6FFF00]/20 bg-[#6FFF00]/5 px-4 py-3 text-sm text-[#EFF4FF]/75 font-mono">
          <Badge variant="outline" className="border-[#6FFF00]/20 bg-white/5 text-[#6FFF00] font-grotesk">
            Demo mode
          </Badge>
          <span>No wallet. Seeded data.</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10">
          <CardContent className="pt-6">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Score</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{totalScore || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="pt-6">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Credit</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#6FFF00]">${estimatedCredit.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="pt-6">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Records</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{workRecords.length || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardContent className="pt-6">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Status</p>
            <p className="strand-display mt-2 text-sm text-[#EFF4FF] sm:text-base" style={{ color: "#EFF4FF" }}>
              {eligibleCredit ? "Credit open" : "Build score"}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="strand-display text-sm text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Add earnings</h2>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              className={`rounded-lg px-4 py-2 font-grotesk text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPlatform === platform.name
                  ? "bg-[#6FFF00]/20 text-[#EFF4FF] border border-[#6FFF00]/45 shadow-sm"
                  : "border border-white/15 bg-transparent text-[#EFF4FF] hover:border-[#6FFF00] hover:text-[#6FFF00]"
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>

        <EarningsUpload
          platform={selectedPlatform}
          onUploadComplete={() => setRefreshToken((v) => v + 1)}
        />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="strand-display mb-4 text-sm text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>Score</h2>
          {scoreComponents ? (
            <ScoreBreakdown
              components={scoreComponents}
              totalScore={totalScore}
              inrRate={INR_TO_USD_RATE}
            />
          ) : (
            <Card className="border-white/10">
              <CardContent className="py-8">
                <p className="text-center font-mono text-sm text-[#EFF4FF]/75">No score yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="strand-display mb-4 text-sm text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>History</h2>
          <WorkRecordsDisplay
            records={workRecords}
            inrRate={INR_TO_USD_RATE}
            isLoading={isLoading}
          />
        </div>

        <Card className="border-[#6FFF00]/20 bg-gradient-to-br from-[#6FFF00]/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-base text-[#EFF4FF]">Credit</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-sm text-[#EFF4FF]/75">{eligibleCredit ? "Ready for credit" : "Build to unlock credit"}</p>
              <p className="font-grotesk text-lg font-semibold text-[#EFF4FF]">{eligibleCredit ? "Eligible" : "Build score"}</p>
            </div>
            <Link href="/worker/credit" className="rounded-full border border-[#6FFF00] px-5 py-2 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] bg-[#6FFF00]/10 transition-colors hover:bg-[#6FFF00]/20">
              Open credit
            </Link>
          </CardContent>
        </Card>
      </div>
    </SaasShell>
  );

  if (isLoading || error) {
    if (!shouldRequireWallet) {
      return content;
    }
    return (
      <RequireWallet redirectTo="/login/worker">
        <SaasShell
          productLabel="Worker Workspace"
          title="Overview"
          subtitle={error ? "There was a problem loading your data" : "Loading your data..."}
          nav={NAV}
        >
          <div className="flex items-center justify-center h-64">
            {error ? (
              <div className="text-center space-y-2">
                <p className="font-grotesk font-medium text-red-400">Unable to load your profile</p>
                <p className="font-mono text-sm text-[#EFF4FF]/75">{formatErrorMessage(error)}</p>
              </div>
            ) : (
              <p className="font-mono text-[#EFF4FF]/75">Loading...</p>
            )}
          </div>
        </SaasShell>
      </RequireWallet>
    );
  }

  return shouldRequireWallet ? (
    <RequireWallet redirectTo="/login/worker">{content}</RequireWallet>
  ) : (
    content
  );
}