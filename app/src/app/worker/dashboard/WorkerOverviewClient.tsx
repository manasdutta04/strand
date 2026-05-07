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
  const wallet = publicKey?.toBase58() ?? null;
  const { workRecords, scoreComponents, totalScore, isLoading, error } = useWorkerProfile(wallet, demoMode);
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
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <Badge variant="outline" className="border-primary/20 bg-background/70 text-primary">
            Demo mode
          </Badge>
          <span>No wallet. Seeded data.</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Score</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{totalScore || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Credit</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">${estimatedCredit.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Records</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{workRecords.length || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{eligibleCredit ? "Open" : "Build"}</p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Add earnings</h2>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPlatform === platform.name
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>

        <EarningsUpload platform={selectedPlatform} />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-base font-semibold">Score</h2>
          {scoreComponents ? (
            <ScoreBreakdown
              components={scoreComponents}
              totalScore={totalScore}
              inrRate={INR_TO_USD_RATE}
            />
          ) : (
            <Card className="border-border/60">
              <CardContent className="py-8">
                <p className="text-center text-sm text-muted-foreground">No score yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold">History</h2>
          <WorkRecordsDisplay
            records={workRecords}
            inrRate={INR_TO_USD_RATE}
            isLoading={isLoading}
          />
        </div>

        <Card className="border-primary/15 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Credit</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{eligibleCredit ? "Ready for credit" : "Build to unlock credit"}</p>
              <p className="text-lg font-semibold">{eligibleCredit ? "Eligible" : "Build score"}</p>
            </div>
            <Link href="/worker/credit" className="btn-accent">
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
                <p className="text-red-600 font-medium">Unable to load your profile</p>
                <p className="text-sm text-muted-foreground">{formatErrorMessage(error)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
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