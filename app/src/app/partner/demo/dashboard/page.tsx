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
      <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(118,169,255,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(118,169,255,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo Mode</p>
            <p className="mt-1 font-medium text-foreground">This page shows simulated portfolio data.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total capital deployed</p>
          <div className="mt-2 text-5xl font-semibold tracking-tight">${totalExposure.toLocaleString()}</div>
          <p className="mt-2 text-sm text-muted-foreground">Active lending portfolio • risk diversified</p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active Borrowers</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{activeBorrowers}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Average APR</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{avgApr.toFixed(1)}%</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Utilization Rate</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{utilizationRate}%</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Yield Generated</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">${Math.round(totalExposure * (avgApr / 100) / 12).toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">Monthly estimate</p>
          </article>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-lg font-semibold">Live Loan Book</h2>
          <div className="space-y-2">
            {DEMO_PORTFOLIO.map((item) => (
              <div
                key={`${item.worker}-${item.maxUsdc}`}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <span>Worker {item.worker.slice(0, 6)}…{item.worker.slice(-4)}</span>
                <span>{item.active ? `APR ${item.apr.toFixed(1)}%` : "Inactive"}</span>
                <span>${item.borrowedUsdc.toLocaleString()} / ${item.maxUsdc.toLocaleString()}</span>
                <span className="text-muted-foreground">
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
