"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useLenderPortfolio } from "../../../hooks/useLenderPortfolio";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Portfolio", href: "/partner/dashboard" },
  { label: "Underwriting Queue", href: "/partner/dashboard/queue" }
];

export default function PartnerDashboardPage() {
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
    <RequireWallet redirectTo="/login/partner">
      <SaasShell
        productLabel="Partner Workspace"
        title="Overview"
        subtitle="Monitor capital deployment, APR, and borrower utilization."
        nav={NAV}
      >
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Total capital deployed</p>
          <div className="mt-2 font-grotesk text-5xl font-semibold tracking-tight text-[#EFF4FF]">${isLoading ? "—" : totalExposure.toLocaleString()}</div>
          <p className="mt-2 font-mono text-sm text-[#EFF4FF]/75">Active lending portfolio • risk diversified</p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Active Borrowers</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{isLoading ? "—" : activeBorrowers}</p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Average APR</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{isLoading ? "—" : `${avgApr.toFixed(1)}%`}</p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Utilization Rate</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{isLoading ? "—" : `${utilizationRate}%`}</p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Yield Generated</p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#6FFF00]">{isLoading ? "—" : `$${Math.round(totalExposure * (avgApr / 100) / 12).toLocaleString()}`}</p>
            <p className="mt-1 font-mono text-xs text-[#EFF4FF]/75">Monthly estimate</p>
          </article>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <h2 className="font-grotesk mb-3 text-lg font-semibold text-[#EFF4FF]">Live Loan Book</h2>
          {error ? (
            <p className="font-mono text-sm text-red-400">
              {formatErrorMessage(error)}
            </p>
          ) : isLoading ? (
            <p className="font-mono text-sm text-[#EFF4FF]/75">Loading partner portfolio...</p>
          ) : portfolio.length === 0 ? (
            <p className="font-mono text-sm text-[#EFF4FF]/75">No active credit lines found for this wallet.</p>
          ) : (
            <div className="space-y-2">
              {portfolio.map((item) => (
                <div
                  key={`${item.worker}-${item.maxUsdc}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-[#EFF4FF]"
                >
                  <span>Worker {item.worker.slice(0, 6)}…{item.worker.slice(-4)}</span>
                  <span>{item.active ? `APR ${item.apr.toFixed(1)}%` : "Inactive"}</span>
                  <span className="text-[#6FFF00]">${item.borrowedUsdc.toLocaleString()} / ${item.maxUsdc.toLocaleString()}</span>
                  <span className="text-[#EFF4FF]/75">
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