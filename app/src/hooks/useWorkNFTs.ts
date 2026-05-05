"use client";

import { useEffect, useState } from "react";
import { WorkNFTCardData } from "../components/WorkNFTCard";
import { listWorkNfts } from "../lib/data-access";

const FALLBACK_NFTS: WorkNFTCardData[] = [];

export function useWorkNFTs(walletAddress?: string | null, refreshToken?: number) {
  const [workNfts, setWorkNfts] = useState<WorkNFTCardData[]>(FALLBACK_NFTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setWorkNfts([]);
      setIsLoading(false);
      return;
    }
    const walletAddressSafe = walletAddress;

    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const nfts = await listWorkNfts(walletAddressSafe);
        if (!cancelled) {
          setWorkNfts(nfts as WorkNFTCardData[]);
        }
      } catch {
        if (!cancelled) {
          setWorkNfts(FALLBACK_NFTS);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [walletAddress, refreshToken]);

  return {
    workNfts,
    isLoading
  };
}
