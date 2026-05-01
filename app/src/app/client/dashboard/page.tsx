"use client";

import Link from "next/link";
import { SaasShell } from "../../../components/SaasShell";

const NAV = [
  { label: "Overview", href: "/client/dashboard" },
  { label: "Create Job", href: "/client/jobs/new" }
];

const ACTIVE_JOBS = [
  { id: "JOB-2041", worker: "8f6M...6Hu6", amount: 950, status: "In Progress" },
  { id: "JOB-2042", worker: "Ez95...YiS6", amount: 850, status: "Awaiting Review" }
];

export default function ClientDashboardPage() {
  return (
    <SaasShell
      productLabel="Client Workspace"
      title="Hiring Operations"
      subtitle="Manage escrow-backed jobs and completion workflow."
      nav={NAV}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Open Jobs</p>
          <p className="mt-2 text-3xl font-semibold">12</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Escrowed USDC</p>
          <p className="mt-2 text-3xl font-semibold">$14,200</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Completion Rate</p>
          <p className="mt-2 text-3xl font-semibold">94%</p>
        </article>
      </section>

      <section className="panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Job Queue</h2>
          <Link className="btn-accent" href="/client/jobs/new">
            Create New Job
          </Link>
        </div>
        <div className="space-y-2">
          {ACTIVE_JOBS.map((job) => (
            <div
              key={job.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
            >
              <span>{job.id}</span>
              <span className="text-muted">Worker {job.worker}</span>
              <span>${job.amount.toLocaleString()}</span>
              <span className="text-accent">{job.status}</span>
            </div>
          ))}
        </div>
      </section>
    </SaasShell>
  );
}
