"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Portfolio", href: "/partner/dashboard" },
  { label: "Underwriting Queue", href: "/partner/dashboard/queue" }
];

interface ApprovalItem {
  recordId: string;
  worker: string;
  amountUsdc: number;
  status: "pending" | "approved";
}

export default function PartnerDashboardPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) {
      setApprovals([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/partner/pending-approvals");
        const payload = await resp.json();
        if (!resp.ok) {
          throw new Error(payload?.error ?? "Failed to load partner records");
        }
        if (!cancelled) {
          setApprovals(payload.approvals ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load partner records");
          setApprovals([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const totalExposure = useMemo(
    () => approvals.reduce((sum, item) => sum + Number(item.amountUsdc || 0), 0),
    [approvals]
  );
  const activeBorrowers = approvals.length;
  const avgApr = activeBorrowers > 0 ? 14.5 : 0;
  const utilizationRate = activeBorrowers > 0 ? 42 : 0;

  return (
    <RequireWallet redirectTo="/login/partner">
      <SaasShell
        productLabel="Partner Workspace"
        title="Overview"
        subtitle="Monitor capital deployment, APR, and borrower utilization."
        nav={NAV}
      >
        {error ? (
          <p className="text-sm text-red-400">{formatErrorMessage(error)}</p>
        ) : null}
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="strand-display text-sm text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>
            Total capital deployed
          </h2>
          <div className="mt-3 font-grotesk text-5xl font-semibold tracking-tight text-[#EFF4FF]">
            ${isLoading ? "-" : totalExposure.toLocaleString()}
          </div>
          <p className="mt-2 font-mono text-sm text-[#EFF4FF]/75">Active lending portfolio</p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>
              Active Borrowers
            </p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">
              {isLoading ? "-" : activeBorrowers}
            </p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>
              Average APR
            </p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">
              {isLoading ? "-" : `${avgApr.toFixed(1)}%`}
            </p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>
              Utilization Rate
            </p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">
              {isLoading ? "-" : `${utilizationRate}%`}
            </p>
          </article>
          <article className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="strand-display text-xs text-[#EFF4FF]" style={{ color: "#EFF4FF" }}>
              Yield Generated
            </p>
            <p className="mt-2 font-grotesk text-3xl font-semibold tracking-tight text-[#6FFF00]">
              {isLoading ? "-" : `$${Math.round((totalExposure * avgApr) / 1200).toLocaleString()}`}
            </p>
            <p className="mt-1 font-mono text-xs text-[#EFF4FF]/75">Monthly estimate</p>
          </article>
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
