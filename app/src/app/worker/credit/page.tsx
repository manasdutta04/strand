"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { CreditPanel } from "../../../components/CreditPanel";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useCreditLine } from "../../../hooks/useCreditLine";
import { useStrandScore } from "../../../hooks/useStrandScore";
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
  const { score, isLoading: scoreLoading, error: scoreError } = useStrandScore(wallet);
  const { creditLine, borrow, repay, isLoading: creditLoading, error: creditError } = useCreditLine(wallet, score);

  const isLoading = scoreLoading || creditLoading;
  const hasErrors = scoreError || creditError;

  if (isLoading || hasErrors) {
    return (
      <RequireWallet redirectTo="/login/worker">
        <SaasShell
          productLabel="Worker Workspace"
          title="Credit Access"
          subtitle={hasErrors ? "There was a problem loading credit information" : "Loading credit information..."}
          nav={NAV}
        >
          <div className="flex items-center justify-center h-64">
            {hasErrors ? (
              <div className="text-center space-y-2">
                <p className="font-grotesk font-medium text-red-400">Unable to load credit data</p>
                {scoreError && <p className="font-mono text-sm text-[#EFF4FF]/75">{formatErrorMessage(scoreError)}</p>}
                {creditError && <p className="font-mono text-sm text-[#EFF4FF]/75">{formatErrorMessage(creditError)}</p>}
              </div>
            ) : (
              <p className="font-mono text-[#EFF4FF]/75">Loading...</p>
            )}
          </div>
        </SaasShell>
      </RequireWallet>
    );
  }

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
         title="Build Your Reputation"
         subtitle="Manage credit lines and borrow against your verified Strand score."
        nav={NAV}
      >
        <CreditPanel creditLine={creditLine} onBorrow={borrow} onRepay={repay} />
      </SaasShell>
    </RequireWallet>
  );
}
