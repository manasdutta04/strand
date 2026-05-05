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
                <p className="text-red-600 font-medium">Unable to load credit data</p>
                {scoreError && <p className="text-sm text-muted-foreground">{formatErrorMessage(scoreError)}</p>}
                {creditError && <p className="text-sm text-muted-foreground">{formatErrorMessage(creditError)}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
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
