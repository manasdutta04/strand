"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditLineView } from "../components/CreditPanel";
import { getCreditLineAndLoan } from "../lib/data-access";

export function useCreditLine(walletAddress?: string | null, score = 0, refreshToken?: number) {
  const [creditLine, setCreditLine] = useState<CreditLineView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setCreditLine(null);
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
        const state = await getCreditLineAndLoan(walletAddressSafe);
        if (cancelled) {
          return;
        }

        if (!state.hasCreditLine) {
          setCreditLine(null);
          return;
        }

        setCreditLine({
          maxUsdc: state.maxUsdc,
          apr: state.apr,
          borrowedUsdc: state.borrowedUsdc
        });
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load credit line";
          setError(errorMessage);
          setCreditLine(null);
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
  }, [walletAddress, score, refreshToken]);

  const borrow = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No credit line available.");
      }
      void amount;
      throw new Error("Borrow transaction wiring is part of Day 2 implementation.");
    },
    [creditLine]
  );

  const repay = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No active loan to repay.");
      }
      void amount;
      throw new Error("Repay transaction wiring is part of Day 2 implementation.");
    },
    [creditLine]
  );

  return {
    creditLine,
    borrow,
    repay,
    isLoading,
    error
  };
}
