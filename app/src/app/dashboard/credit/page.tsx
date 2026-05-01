"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { CreditPanel } from "../../../components/CreditPanel";
import { SaasShell } from "../../../components/SaasShell";
import { useCreditLine } from "../../../hooks/useCreditLine";
import { useStrandScore } from "../../../hooks/useStrandScore";

const NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Work History", href: "/dashboard/work" },
  { label: "Skills", href: "/dashboard/skills" },
  { label: "Credit", href: "/dashboard/credit" }
];

export default function WorkerCreditPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { score } = useStrandScore(wallet);
  const { creditLine, borrow, repay } = useCreditLine(wallet, score);

  return (
    <SaasShell
      productLabel="Worker Workspace"
      title="Credit Access"
      subtitle="Borrowing operations against score-qualified credit lines."
      nav={NAV}
    >
      <CreditPanel creditLine={creditLine} onBorrow={borrow} onRepay={repay} />
    </SaasShell>
  );
}
