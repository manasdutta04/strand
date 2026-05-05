"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
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
  const { workNfts, isLoading } = useWorkNFTs(wallet);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Work History"
        subtitle="Immutable records of completed jobs and delivery quality."
        nav={NAV}
      >
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading work history...</p>
            ) : workNfts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records yet. Complete jobs to mint your first Work NFT.</p>
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
