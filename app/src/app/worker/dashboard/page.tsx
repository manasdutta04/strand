"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useCreditLine } from "../../../hooks/useCreditLine";
import { useStrandScore } from "../../../hooks/useStrandScore";
import { useWorkNFTs } from "../../../hooks/useWorkNFTs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerOverviewPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { score, tier, stats, isLoading: scoreLoading, error: scoreError } = useStrandScore(wallet);
  const { workNfts, isLoading: nftsLoading, error: nftsError } = useWorkNFTs(wallet);
  const { creditLine, isLoading: creditLoading, error: creditError } = useCreditLine(wallet, score);

  const isLoading = scoreLoading || nftsLoading || creditLoading;
  const hasErrors = scoreError || nftsError || creditError;

  if (isLoading || hasErrors) {
    return (
      <RequireWallet redirectTo="/login/worker">
        <SaasShell
          productLabel="Worker Workspace"
          title="Performance Overview"
          subtitle={hasErrors ? "There was a problem loading your data" : "Loading your data..."}
          nav={NAV}
        >
          <div className="flex items-center justify-center h-64">
            {hasErrors ? (
              <div className="text-center space-y-2">
                <p className="text-red-600 font-medium">Unable to load performance data</p>
                {scoreError && <p className="text-sm text-muted-foreground">{formatErrorMessage(scoreError)}</p>}
                {nftsError && <p className="text-sm text-muted-foreground">{formatErrorMessage(nftsError)}</p>}
                {creditError && <p className="text-sm text-muted-foreground">{formatErrorMessage(creditError)}</p>}
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
        title="Overview"
        subtitle="Track work history, earnings, and credit readiness."
        nav={NAV}
      >
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Strand score</p>
          <div className="mt-2 text-5xl font-semibold tracking-tight">{score}</div>
          <p className="mt-2 text-sm text-muted-foreground">{tier} tier • verified reputation</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Completed Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stats.jobsDone}</div>
              <p className="text-sm text-muted-foreground">Verified work history</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">${stats.totalEarnedUsdc.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">USDC earned and available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Credit Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {creditLine ? `$${(creditLine.maxUsdc - creditLine.borrowedUsdc).toLocaleString()}` : "$0"}
              </div>
              <p className="text-sm text-muted-foreground">Available to borrow</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Work</CardTitle>
                <Link className="text-sm text-foreground underline-offset-4 hover:underline" href="/worker/work">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {workNfts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No work records yet. Complete your first job to begin.</p>
              ) : (
                <div className="space-y-2">
                  {workNfts.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      ${item.amountUsdc.toLocaleString()} · {item.skills.join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link className="block rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-accent/40" href="/client/jobs/new">
                  Post a new client job
                </Link>
                <Link className="block rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-accent/40" href="/worker/skills">
                  Add or review skill attestations
                </Link>
                <Link className="block rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-accent/40" href="/worker/credit">
                  Check borrowing readiness
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </SaasShell>
    </RequireWallet>
  );
}
