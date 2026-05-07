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

  const content = (
    <SaasShell
      productLabel={demoMode ? "Worker Workspace · Demo" : "Worker Workspace"}
      title="Dashboard"
      subtitle={demoMode ? "Explore the product with simulated worker data." : "Track earnings, build reputation, and access credit."}
      nav={NAV}
    >
      {demoMode && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Sandbox mode</p>
              <p className="mt-1 font-medium text-foreground">Wallet is optional here. The demo loads instantly.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
              <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1">No wallet needed</span>
              <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1">Simulated earnings</span>
              <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1">Instant score</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Choose Platform</h2>
            <p className="text-sm text-muted-foreground">Pick the source for the record you want to add</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedPlatform === platform.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
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
          <h2 className="text-lg font-semibold mb-4">Reputation Score</h2>
          {scoreComponents ? (
            <ScoreBreakdown
              components={scoreComponents}
              totalScore={totalScore}
              inrRate={INR_TO_USD_RATE}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No score data yet. Upload your first earnings to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Work History</h2>
          <WorkRecordsDisplay
            records={workRecords}
            inrRate={INR_TO_USD_RATE}
            isLoading={isLoading}
          />
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base">Credit Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your Strand Score determines how much credit you can access. Build your reputation by adding work
              records and maintaining consistent earnings.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Status</p>
                <p className="text-lg font-semibold">
                  {totalScore >= 400 ? (
                    <span className="text-green-600">✓ Eligible</span>
                  ) : (
                    <span className="text-yellow-600">Build Score</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Next Step</p>
                <Link
                  href="/worker/credit"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Credit →
                </Link>
              </div>
            </div>
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