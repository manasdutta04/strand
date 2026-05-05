"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useClientJobs } from "../../../hooks/useClientJobs";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Overview", href: "/client/dashboard" },
  { label: "Create Job", href: "/client/jobs/new" }
];

export default function ClientDashboardPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { jobs, isLoading, error } = useClientJobs(wallet);

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
        title="Overview"
        subtitle="Monitor escrow, active jobs, and completion flow."
        nav={NAV}
      >
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active jobs</p>
          <div className="mt-2 text-5xl font-semibold tracking-tight">{isLoading ? "—" : activeJobs.length}</div>
          <p className="mt-2 text-sm text-muted-foreground">Jobs in progress • escrow protected</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Escrowed</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {isLoading ? "—" : `$${totalEscrowed.toLocaleString()}`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Capital reserved for open work</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Completion Rate</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {isLoading ? "—" : `${completionRate}%`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Completed jobs vs total</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workers Hired</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {isLoading ? "—" : jobs.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Total jobs posted</p>
          </article>
        </section>

        <section className="panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Job Queue</h2>
            <Link className="btn-accent" href="/client/jobs/new">
              Create New Job
            </Link>
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              {formatErrorMessage(error)}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your client jobs...</p>
          ) : activeJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active jobs found on-chain. Post a new job to get started.</p>
          ) : (
            <div className="space-y-2">
              {activeJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span>JOB-{job.jobId}</span>
                  <span className="text-muted-foreground">Worker {job.worker.slice(0, 6)}…{job.worker.slice(-4)}</span>
                  <span>${job.amountUsdc.toLocaleString()}</span>
                  <span className="text-muted-foreground">{job.state}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
