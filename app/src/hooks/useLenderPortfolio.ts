"use client";

import { useEffect, useState } from "react";
import { ChainLenderPortfolioItem, listLenderPortfolio } from "../lib/data-access";

export function useLenderPortfolio(walletAddress?: string | null, refreshToken?: number) {
  const [portfolio, setPortfolio] = useState<ChainLenderPortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setPortfolio([]);
      setIsLoading(false);
      return;
    }

    const walletAddressSafe = walletAddress;
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const lenderPortfolio = await listLenderPortfolio(walletAddressSafe);
        if (!cancelled) {
          setPortfolio(lenderPortfolio);
        }
      } catch {
        if (!cancelled) {
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
    isLoading
  };
}
