"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getCreditLine, CreditLine } from "../lib/data";

export interface CreditLineView {
  maxUsdc: number;
  apr: number;
  borrowedUsdc: number;
}

export function useCreditLine(walletAddress?: string | null, score = 0, refreshToken?: number) {
  const [creditLine, setCreditLine] = useState<CreditLineView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setCreditLine(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const wallet = new PublicKey(walletAddress);
        const line = await getCreditLine(wallet);
        setCreditLine(line ? {
          maxUsdc: line.maxUsdc,
          apr: line.apr,
          borrowedUsdc: line.borrowedUsdc
        } : null);
      } catch (error) {
        console.error("Failed to fetch credit line:", error);
        setCreditLine(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletAddress, score, refreshToken]);

  const borrow = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No credit line available.");
      }
      if (amount > creditLine.maxUsdc - creditLine.borrowedUsdc) {
        throw new Error("Amount exceeds available limit.");
      }

      // TODO: Implement actual borrow transaction
      throw new Error("Borrow transaction not implemented");
    },
    [creditLine]
  );

  const repay = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No active loan to repay.");
      }

      // TODO: Implement actual repay transaction
      throw new Error("Repay transaction not implemented");
    },
    [creditLine]
  );

  return {
    creditLine,
    borrow,
    repay,
    isLoading
  };
}
