"use client";

import { useEffect, useState } from "react";
import { ChainJobEscrow, listClientJobs } from "../lib/data-access";

export function useClientJobs(walletAddress?: string | null, refreshToken?: number) {
  const [jobs, setJobs] = useState<ChainJobEscrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setJobs([]);
      setIsLoading(false);
      return;
    }

    const walletAddressSafe = walletAddress;
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const openJobs = await listClientJobs(walletAddressSafe);
        if (!cancelled) {
          setJobs(openJobs);
        }
      } catch {
        if (!cancelled) {
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
    isLoading
  };
}
