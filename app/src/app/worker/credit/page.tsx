"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { CreditPanel } from "../../../components/CreditPanel";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useWorkerProfile } from "../../../hooks/useWorkerProfile";
import { formatErrorMessage } from "../../../lib/error-formatter";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerCreditPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { creditSummary, isLoading, error } = useWorkerProfile(wallet, false);

  if (isLoading || error) {
    return (
      <RequireWallet redirectTo="/login/worker">
        <SaasShell
          productLabel="Worker Workspace"
          title="Credit Access"
          subtitle={error ? "There was a problem loading credit information" : "Loading credit information..."}
          nav={NAV}
          showSettings={true}
        >
          <div className="flex items-center justify-center h-64">
            {error ? (
              <div className="text-center space-y-2">
                <p className="font-grotesk font-medium text-red-400">Unable to load credit data</p>
                <p className="font-mono text-sm text-[#EFF4FF]/75">{formatErrorMessage(error.message)}</p>
              </div>
            ) : (
              <p className="font-mono text-[#EFF4FF]/75">Loading...</p>
            )}
          </div>
        </SaasShell>
      </RequireWallet>
    );
  }

  const creditLine = creditSummary.eligible
    ? {
        maxUsdc: creditSummary.maxUsdc,
        apr: creditSummary.apr ?? 18,
        borrowedUsdc: creditSummary.borrowedUsdc
      }
    : null;

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Build Your Reputation"
        subtitle="Manage credit lines and borrow against your verified Strand score."
        nav={NAV}
      >
        <CreditPanel
          creditLine={creditLine}
          onBorrow={async () => {
            throw new Error("Borrow actions are not enabled in this data-only non-demo mode yet.");
          }}
          onRepay={async () => {
            throw new Error("Repay actions are not enabled in this data-only non-demo mode yet.");
          }}
        />
      </SaasShell>
    </RequireWallet>
  );
}
