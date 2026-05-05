"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useClientJobs } from "../../../hooks/useClientJobs";

const NAV = [
  { label: "Overview", href: "/client/dashboard" },
  { label: "Create Job", href: "/client/jobs/new" }
];

export default function ClientDashboardPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { jobs, isLoading } = useClientJobs(wallet);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.state === "Open"),
    [jobs]
  );
  const totalEscrowed = useMemo(
    () => activeJobs.reduce((sum, job) => sum + job.amountUsdc, 0),
    [activeJobs]
  );
  const completedJobs = useMemo(
    () => jobs.filter((job) => job.state === "Closed").length,
    [jobs]
  );
  const completionRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

  return (
    <RequireWallet redirectTo="/login/client">
      <SaasShell
        productLabel="Client Workspace"
        title="Hiring Operations"
        subtitle="Manage escrow-backed jobs and completion workflow."
        nav={NAV}
      >
        <section className="grid gap-4 md:grid-cols-3">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Open Jobs</p>
            <p className="mt-2 text-3xl font-semibold">{isLoading ? "—" : activeJobs.length}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Escrowed USDC</p>
            <p className="mt-2 text-3xl font-semibold">
              {isLoading ? "—" : `$${totalEscrowed.toLocaleString()}`}
            </p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Completion Rate</p>
            <p className="mt-2 text-3xl font-semibold">
              {isLoading ? "—" : `${completionRate}%`}
            </p>
          </article>
        </section>

        <section className="panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Job Queue</h2>
            <Link className="btn-accent" href="/client/jobs/new">
              Create New Job
            </Link>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted">Loading your client jobs...</p>
          ) : activeJobs.length === 0 ? (
            <p className="text-sm text-muted">No active jobs found on-chain. Post a new job to get started.</p>
          ) : (
            <div className="space-y-2">
              {activeJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
                >
                  <span>JOB-{job.jobId}</span>
                  <span className="text-muted">Worker {job.worker.slice(0, 6)}…{job.worker.slice(-4)}</span>
                  <span>${job.amountUsdc.toLocaleString()}</span>
                  <span className="text-accent">{job.state}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
