"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { SaasShell } from "../../components/SaasShell";
import { useCreditLine } from "../../hooks/useCreditLine";
import { useStrandScore } from "../../hooks/useStrandScore";
import { useWorkNFTs } from "../../hooks/useWorkNFTs";

const NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Work History", href: "/dashboard/work" },
  { label: "Skills", href: "/dashboard/skills" },
  { label: "Credit", href: "/dashboard/credit" }
];

export default function WorkerOverviewPage() {
  const { connected, publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { score, tier, stats } = useStrandScore(wallet);
  const { workNfts } = useWorkNFTs(wallet);
  const { creditLine } = useCreditLine(wallet, score);

  if (!connected || !wallet) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
        <section className="panel p-6">
          <h1 className="text-2xl font-semibold">Worker Workspace</h1>
          <p className="mt-2 text-sm text-muted">
            Connect wallet to access worker dashboards and metrics.
          </p>
          <Link className="btn-accent mt-5" href="/login/worker">
            Go To Worker Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <SaasShell
      productLabel="Worker Workspace"
      title="Performance Overview"
      subtitle="Track your verified output and credit readiness."
      nav={NAV}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Strand Score</p>
          <p className="mt-2 text-3xl font-semibold text-accent">{score}</p>
          <p className="text-sm text-muted">{tier} tier</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Completed Jobs</p>
          <p className="mt-2 text-3xl font-semibold">{stats.jobsDone}</p>
          <p className="text-sm text-muted">All-time verified jobs</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Total Earnings</p>
          <p className="mt-2 text-3xl font-semibold">${stats.totalEarnedUsdc.toLocaleString()}</p>
          <p className="text-sm text-muted">USDC equivalent</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Credit Capacity</p>
          <p className="mt-2 text-3xl font-semibold">
            {creditLine ? `$${(creditLine.maxUsdc - creditLine.borrowedUsdc).toLocaleString()}` : "$0"}
          </p>
          <p className="text-sm text-muted">Available from active lines</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Work</h2>
            <Link className="text-sm text-accent" href="/dashboard/work">
              View all
            </Link>
          </div>
          {workNfts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No work records yet. Complete your first job to begin.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {workNfts.slice(0, 3).map((item) => (
                <div
                  key={`${item.client}-${item.completedAt}-${item.amountUsdc}`}
                  className="rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
                >
                  ${item.amountUsdc.toLocaleString()} · {item.skills.join(", ")}
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel p-4">
          <h2 className="text-lg font-semibold">Next Actions</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Link className="block rounded-lg border border-border bg-[#141414] px-3 py-2 hover:bg-card-hover" href="/client/jobs/new">
              Post a new client job
            </Link>
            <Link className="block rounded-lg border border-border bg-[#141414] px-3 py-2 hover:bg-card-hover" href="/dashboard/skills">
              Add or review skill attestations
            </Link>
            <Link className="block rounded-lg border border-border bg-[#141414] px-3 py-2 hover:bg-card-hover" href="/dashboard/credit">
              Check borrowing readiness
            </Link>
          </div>
        </article>
      </section>
    </SaasShell>
  );
}
