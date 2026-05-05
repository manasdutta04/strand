"use client";

import { useEffect, useState } from "react";
import { WorkNFTCardData } from "../components/WorkNFTCard";
import { listWorkNfts } from "../lib/data-access";

export function useWorkNFTs(walletAddress?: string | null, refreshToken?: number) {
  const [workNfts, setWorkNfts] = useState<WorkNFTCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setWorkNfts([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    const walletAddressSafe = walletAddress;

    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const nfts = await listWorkNfts(walletAddressSafe);
        if (!cancelled) {
          setWorkNfts(nfts as WorkNFTCardData[]);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load work NFTs";
          setError(errorMessage);
          setWorkNfts([]);
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
    isLoading,
    error
  };
}
