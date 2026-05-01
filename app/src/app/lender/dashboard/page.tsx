"use client";

import { SaasShell } from "../../../components/SaasShell";

const NAV = [
  { label: "Portfolio", href: "/lender/dashboard" },
  { label: "Underwriting Queue", href: "/lender/dashboard/queue" }
];

const LOANS = [
  { worker: "9hS2...cJ19", score: 742, exposure: 4200, status: "Healthy" },
  { worker: "6xP8...Na42", score: 688, exposure: 2800, status: "Watch" },
  { worker: "7dK3...Yz94", score: 801, exposure: 5200, status: "Healthy" }
];

export default function LenderDashboardPage() {
  return (
    <SaasShell
      productLabel="Lender Workspace"
      title="Credit Portfolio"
      subtitle="Monitor score-linked lending risk and liquidity utilization."
      nav={NAV}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Total Exposure</p>
          <p className="mt-2 text-3xl font-semibold">$12,200</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Active Borrowers</p>
          <p className="mt-2 text-3xl font-semibold">3</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Avg. Score</p>
          <p className="mt-2 text-3xl font-semibold">744</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Default Rate</p>
          <p className="mt-2 text-3xl font-semibold">1.2%</p>
        </article>
      </section>

      <section className="panel p-4">
        <h2 className="mb-3 text-lg font-semibold">Live Loan Book</h2>
        <div className="space-y-2">
          {LOANS.map((loan) => (
            <div
              key={loan.worker}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
            >
              <span>Worker {loan.worker}</span>
              <span>Score {loan.score}</span>
              <span>${loan.exposure.toLocaleString()}</span>
              <span className={loan.status === "Healthy" ? "text-accent" : "text-amber-300"}>{loan.status}</span>
            </div>
          ))}
        </div>
      </section>
    </SaasShell>
  );
}
