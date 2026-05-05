"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useLenderPortfolio } from "../../../hooks/useLenderPortfolio";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Portfolio", href: "/lender/dashboard" },
  { label: "Underwriting Queue", href: "/lender/dashboard/queue" }
];

export default function LenderDashboardPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { portfolio, isLoading, error } = useLenderPortfolio(wallet);

  const totalExposure = useMemo(
    () => portfolio.reduce((sum, item) => sum + item.maxUsdc, 0),
    [portfolio]
  );
  const activeBorrowers = portfolio.length;
  const avgApr = portfolio.length > 0 ? portfolio.reduce((sum, item) => sum + item.apr, 0) / portfolio.length : 0;
  const utilizationRate = portfolio.length > 0 ? Math.round((portfolio.reduce((sum, item) => sum + item.utilization, 0) / portfolio.length) * 100) : 0;

  return (
    <RequireWallet redirectTo="/login/lender">
      <SaasShell
        productLabel="Lender Workspace"
        title="Overview"
        subtitle="Monitor capital deployment, APR, and borrower utilization."
        nav={NAV}
      >
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total capital deployed</p>
          <div className="mt-2 text-5xl font-semibold tracking-tight">${isLoading ? "—" : totalExposure.toLocaleString()}</div>
          <p className="mt-2 text-sm text-muted-foreground">Active lending portfolio • risk diversified</p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active Borrowers</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{isLoading ? "—" : activeBorrowers}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Average APR</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{isLoading ? "—" : `${avgApr.toFixed(1)}%`}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Utilization Rate</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{isLoading ? "—" : `${utilizationRate}%`}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Yield Generated</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{isLoading ? "—" : `$${Math.round(totalExposure * (avgApr / 100) / 12).toLocaleString()}`}</p>
            <p className="mt-1 text-xs text-muted-foreground">Monthly estimate</p>
          </article>
        </section>

        <section className="panel p-4">
          <h2 className="mb-3 text-lg font-semibold">Live Loan Book</h2>
          {error ? (
            <p className="text-sm text-destructive">
              {formatErrorMessage(error)}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading lender portfolio...</p>
          ) : portfolio.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active credit lines found for this wallet.</p>
          ) : (
            <div className="space-y-2">
              {portfolio.map((item) => (
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
          )}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
