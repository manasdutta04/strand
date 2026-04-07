"use client";

import { useEffect, useState } from "react";
import { WorkNFTCardData } from "@/components/WorkNFTCard";

const FALLBACK_NFTS: WorkNFTCardData[] = [];

export function useWorkNFTs(walletAddress?: string | null) {
  const [workNfts, setWorkNfts] = useState<WorkNFTCardData[]>(FALLBACK_NFTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setWorkNfts([]);
      setIsLoading(false);
      return;
    }

    const key = `strand-worknfts:${walletAddress}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(FALLBACK_NFTS));
      setWorkNfts(FALLBACK_NFTS);
      setIsLoading(false);
      return;
    }

    try {
      setWorkNfts(JSON.parse(raw) as WorkNFTCardData[]);
    } catch {
      setWorkNfts(FALLBACK_NFTS);
    }

    setIsLoading(false);
  }, [walletAddress]);

  return {
    workNfts,
    isLoading
  };
}
