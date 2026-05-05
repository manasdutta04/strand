"use client";

import { useEffect, useState } from "react";
import { ChainJobEscrow, listClientJobs } from "../lib/data-access";

export function useClientJobs(walletAddress?: string | null, refreshToken?: number) {
  const [jobs, setJobs] = useState<ChainJobEscrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setJobs([]);
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
        const openJobs = await listClientJobs(walletAddressSafe);
        if (!cancelled) {
          setJobs(openJobs);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load jobs";
          setError(errorMessage);
          setJobs([]);
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
    jobs,
    isLoading,
    error
  };
}
