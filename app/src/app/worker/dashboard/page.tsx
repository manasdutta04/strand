"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useCreditLine } from "../../../hooks/useCreditLine";
import { useStrandScore } from "../../../hooks/useStrandScore";
import { useWorkNFTs } from "../../../hooks/useWorkNFTs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerOverviewPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { score, tier, stats, isLoading: scoreLoading } = useStrandScore(wallet);
  const { workNfts, isLoading: nftsLoading } = useWorkNFTs(wallet);
  const { creditLine, isLoading: creditLoading } = useCreditLine(wallet, score);

  if (scoreLoading || nftsLoading || creditLoading) {
    return (
      <RequireWallet redirectTo="/login/worker">
        <SaasShell
          productLabel="Worker Workspace"
          title="Performance Overview"
          subtitle="Loading your data..."
          nav={NAV}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </SaasShell>
      </RequireWallet>
    );
  }

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Performance Overview"
        subtitle="Track your verified output and credit readiness."
        nav={NAV}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Strand Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{score}</div>
              <p className="text-sm text-muted-foreground">{tier} tier</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Completed Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.jobsDone}</div>
              <p className="text-sm text-muted-foreground">All-time verified jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalEarnedUsdc.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">USDC equivalent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Credit Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {creditLine ? `$${(creditLine.maxUsdc - creditLine.borrowedUsdc).toLocaleString()}` : "$0"}
              </div>
              <p className="text-sm text-muted-foreground">Available from active lines</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Work</CardTitle>
                <Link className="text-sm text-accent hover:underline" href="/worker/work">
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
                      className="rounded-lg border bg-muted/50 px-3 py-2 text-sm"
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
                <Link className="block rounded-lg border bg-muted/50 px-3 py-2 hover:bg-muted transition-colors" href="/client/jobs/new">
                  Post a new client job
                </Link>
                <Link className="block rounded-lg border bg-muted/50 px-3 py-2 hover:bg-muted transition-colors" href="/worker/skills">
                  Add or review skill attestations
                </Link>
                <Link className="block rounded-lg border bg-muted/50 px-3 py-2 hover:bg-muted transition-colors" href="/worker/credit">
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
