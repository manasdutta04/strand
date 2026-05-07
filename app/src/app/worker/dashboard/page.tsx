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

export default function WorkerOverviewPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { workRecords, scoreComponents, totalScore, isLoading, error } = useWorkerProfile(wallet);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].name);

  if (isLoading || error) {
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

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Dashboard"
        subtitle="Track earnings, build reputation, and access credit."
        nav={NAV}
      >
        {/* Upload Section - Most Prominent */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Add Earnings</h2>
              <p className="text-sm text-muted-foreground">Upload a screenshot from one of your delivery platforms</p>
            </div>
          </div>

          {/* Platform Selector */}
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

          {/* Upload Component */}
          <EarningsUpload platform={selectedPlatform} />
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-8">
          {/* Score Section */}
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

          {/* Work Records Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Work History</h2>
            <WorkRecordsDisplay
              records={workRecords}
              inrRate={INR_TO_USD_RATE}
              isLoading={isLoading}
            />
          </div>

          {/* Credit Overview Card */}
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
    </RequireWallet>
  );
}
