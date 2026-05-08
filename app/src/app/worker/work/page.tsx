"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { formatErrorMessage } from "../../../lib/error-formatter";
import { WorkNFTCard } from "../../../components/WorkNFTCard";
import { useWorkNFTs } from "../../../hooks/useWorkNFTs";
import { Card, CardContent } from "../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerWorkHistoryPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { workNfts, isLoading, error } = useWorkNFTs(wallet);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
         title="Build Your Reputation"
         subtitle="Your work history — verified earnings and delivery quality."
        nav={NAV}
      >
        <Card>
          <CardContent className="p-6">
            {error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-center text-sm text-red-400">
                  {formatErrorMessage(error)}
                </p>
              </div>
            ) : isLoading ? (
              <p className="font-mono text-[#EFF4FF]/75">Loading work history...</p>
            ) : workNfts.length === 0 ? (
              <p className="font-mono text-sm text-[#EFF4FF]/75">No records yet. Complete jobs to mint your first Work NFT.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {workNfts.map((item, index) => (
                  <WorkNFTCard key={index} data={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SaasShell>
    </RequireWallet>
  );
}
