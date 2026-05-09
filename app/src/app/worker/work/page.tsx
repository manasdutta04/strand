"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { formatErrorMessage } from "../../../lib/error-formatter";
import { WorkRecordsDisplay } from "../../../components/WorkRecordsDisplay";
import { useWorkerProfile } from "../../../hooks/useWorkerProfile";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

const INR_TO_USD_RATE = parseInt(process.env.NEXT_PUBLIC_INR_TO_USD_RATE || "83", 10);

export default function WorkerWorkHistoryPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { workRecords, isLoading, error } = useWorkerProfile(wallet, false);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Build Your Reputation"
        subtitle="Your work history - verified earnings and delivery quality."
        nav={NAV}
        showSettings={true}
      >
        {error ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-center text-sm text-red-400">{formatErrorMessage(error.message)}</p>
          </div>
        ) : (
          <WorkRecordsDisplay records={workRecords} inrRate={INR_TO_USD_RATE} isLoading={isLoading} />
        )}
      </SaasShell>
    </RequireWallet>
  );
}
