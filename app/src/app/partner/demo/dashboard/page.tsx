"use client";

import { useState, useMemo } from "react";

import { SaasShell } from "../../../../components/SaasShell";
import { Card, CardContent } from "../../../../components/ui/card";

const NAV = [
  { label: "Portfolio", href: "/partner/demo/dashboard" },
  { label: "Underwriting Queue", href: "/partner/demo/dashboard/queue" }
];

// Seeded demo portfolio data
const DEMO_PORTFOLIO = [
  { worker: "7K2mXqJ9vb6p2KwL3n", maxUsdc: 500, borrowedUsdc: 320, utilization: 0.64, apr: 12.5, active: true },
  { worker: "4R7fQ8xZ2pM5nY9wK1", maxUsdc: 750, borrowedUsdc: 480, utilization: 0.64, apr: 11.8, active: true },
  { worker: "9W3sL5jQ1n8vK2x4mR", maxUsdc: 1000, borrowedUsdc: 650, utilization: 0.65, apr: 13.2, active: true },
  { worker: "6B9tP2hF4k7vJ1cM3s", maxUsdc: 600, borrowedUsdc: 360, utilization: 0.60, apr: 10.5, active: true },
  { worker: "2N4dV7sW1y5jF8hK6x", maxUsdc: 800, borrowedUsdc: 520, utilization: 0.65, apr: 12.1, active: true },
];

export default function PartnerDemoDashboardPage() {
  const totalExposure = useMemo(
    () => DEMO_PORTFOLIO.reduce((sum, item) => sum + item.maxUsdc, 0),
    []
  );
  const activeBorrowers = DEMO_PORTFOLIO.length;
  const avgApr = DEMO_PORTFOLIO.reduce((sum, item) => sum + item.apr, 0) / DEMO_PORTFOLIO.length;
  const utilizationRate = Math.round((DEMO_PORTFOLIO.reduce((sum, item) => sum + item.utilization, 0) / DEMO_PORTFOLIO.length) * 100);

  return (
    <SaasShell
      productLabel="Partner Workspace · Demo"
      title="Portfolio"
      subtitle="Monitor capital deployment, APR, and borrower utilization."
      nav={NAV}
    >
      <div className="mb-6 rounded-2xl border border-[#76A9FF]/20 bg-[linear-gradient(135deg,rgba(118,169,255,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-[#EFF4FF]/75 shadow-[0_0_0_1px_rgba(118,169,255,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#76A9FF]">Demo Mode</p>
            <p className="font-grotesk mt-1 font-medium text-[#EFF4FF]">This page shows simulated portfolio data.</p>
          </div>
          <span className="rounded-full border border-[#76A9FF]/20 bg-white/5 backdrop-blur-sm px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#76A9FF] font-grotesk font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="panel p-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
          <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Total capital deployed</p>
          <div className="font-grotesk mt-2 text-5xl font-semibold tracking-tight text-[#EFF4FF]">${totalExposure.toLocaleString()}</div>
          <p className="font-mono mt-2 text-sm text-[#EFF4FF]/75">Active lending portfolio • risk diversified</p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="panel p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Active Borrowers</p>
            <p className="font-grotesk mt-2 text-3xl font-semibold tracking-tight text-[#EFF4FF]">{activeBorrowers}</p>
          </article>
          <article className="panel p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Average APR</p>
            <p className="font-grotesk mt-2 text-3xl font-semibold tracking-tight text-[#EFF4FF]">{avgApr.toFixed(1)}%</p>
          </article>
          <article className="panel p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Utilization Rate</p>
            <p className="font-grotesk mt-2 text-3xl font-semibold tracking-tight text-[#EFF4FF]">{utilizationRate}%</p>
          </article>
          <article className="panel p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Yield Generated</p>
            <p className="font-grotesk mt-2 text-3xl font-semibold tracking-tight text-[#EFF4FF]">${Math.round(totalExposure * (avgApr / 100) / 12).toLocaleString()}</p>
            <p className="font-mono mt-1 text-xs text-[#EFF4FF]/75">Monthly estimate</p>
          </article>
        </section>

        <section className="panel p-4 border border-white/10 bg-white/5 backdrop-blur-sm rounded-[32px]">
          <h2 className="font-grotesk mb-3 text-lg font-semibold text-[#EFF4FF]">Live Loan Book</h2>
          <div className="space-y-2">
            {DEMO_PORTFOLIO.map((item) => (
              <div
                key={`${item.worker}-${item.maxUsdc}`}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-sm font-mono text-[#EFF4FF]"
              >
                <span>Worker {item.worker.slice(0, 6)}…{item.worker.slice(-4)}</span>
                <span>{item.active ? `APR ${item.apr.toFixed(1)}%` : "Inactive"}</span>
                <span>${item.borrowedUsdc.toLocaleString()} / ${item.maxUsdc.toLocaleString()}</span>
                <span className="text-[#EFF4FF]/60">
                  {Math.round(item.utilization * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SaasShell>
  );
}
