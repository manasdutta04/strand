"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { CreditPanel } from "../../../components/CreditPanel";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useCreditLine } from "../../../hooks/useCreditLine";
import { useStrandScore } from "../../../hooks/useStrandScore";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerCreditPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { score } = useStrandScore(wallet);
  const { creditLine, borrow, repay } = useCreditLine(wallet, score);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Credit Access"
        subtitle="Borrowing operations against score-qualified credit lines."
        nav={NAV}
      >
        <CreditPanel creditLine={creditLine} onBorrow={borrow} onRepay={repay} />
      </SaasShell>
    </RequireWallet>
  );
}
