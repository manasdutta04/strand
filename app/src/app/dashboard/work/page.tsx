"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { SaasShell } from "../../../components/SaasShell";
import { WorkNFTCard } from "../../../components/WorkNFTCard";
import { useWorkNFTs } from "../../../hooks/useWorkNFTs";

const NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Work History", href: "/dashboard/work" },
  { label: "Skills", href: "/dashboard/skills" },
  { label: "Credit", href: "/dashboard/credit" }
];

export default function WorkerWorkHistoryPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { workNfts } = useWorkNFTs(wallet);

  return (
    <SaasShell
      productLabel="Worker Workspace"
      title="Work History"
      subtitle="Immutable records of completed jobs and delivery quality."
      nav={NAV}
    >
      <section className="panel p-4">
        {workNfts.length === 0 ? (
          <p className="text-sm text-muted">No records yet. Complete jobs to mint your first Work NFT.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {workNfts.map((item) => (
              <WorkNFTCard key={`${item.client}-${item.completedAt}-${item.amountUsdc}`} data={item} />
            ))}
          </div>
        )}
      </section>
    </SaasShell>
  );
}
