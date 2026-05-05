"use client";

import { useEffect, useState } from "react";
import { ChainLenderPortfolioItem, listLenderPortfolio } from "../lib/data-access";

export function useLenderPortfolio(walletAddress?: string | null, refreshToken?: number) {
  const [portfolio, setPortfolio] = useState<ChainLenderPortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setPortfolio([]);
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
        const lenderPortfolio = await listLenderPortfolio(walletAddressSafe);
        if (!cancelled) {
          setPortfolio(lenderPortfolio);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load portfolio";
          setError(errorMessage);
          setPortfolio([]);
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
    portfolio,
    isLoading,
    error
  };
}
