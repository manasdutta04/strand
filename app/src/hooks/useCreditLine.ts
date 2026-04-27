"use client";

import { useCallback, useEffect, useState } from "react";
import { aprFromScore } from "../lib/score";
import { CreditLineView } from "../components/CreditPanel";

export function useCreditLine(walletAddress?: string | null, score = 0) {
  const [creditLine, setCreditLine] = useState<CreditLineView | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setCreditLine(null);
      return;
    }

    const key = `strand-credit:${walletAddress}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCreditLine(JSON.parse(saved) as CreditLineView);
        return;
      } catch {
        setCreditLine(null);
      }
    }

    if (score >= 100) {
      const seeded: CreditLineView = {
        maxUsdc: score * 10,
        apr: aprFromScore(score),
        borrowedUsdc: 0
      };
      localStorage.setItem(key, JSON.stringify(seeded));
      setCreditLine(seeded);
    } else {
      setCreditLine(null);
    }
  }, [walletAddress, score]);

  const persist = useCallback(
    (next: CreditLineView | null) => {
      setCreditLine(next);
      if (!walletAddress || !next) {
        return;
      }
      localStorage.setItem(`strand-credit:${walletAddress}`, JSON.stringify(next));
    },
    [walletAddress]
  );

  const borrow = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No credit line available.");
      }
      if (amount > creditLine.maxUsdc - creditLine.borrowedUsdc) {
        throw new Error("Amount exceeds available limit.");
      }

      const next: CreditLineView = {
        ...creditLine,
        borrowedUsdc: creditLine.borrowedUsdc + amount
      };
      persist(next);
    },
    [creditLine, persist]
  );

  const repay = useCallback(
    async (amount: number) => {
      if (!creditLine) {
        throw new Error("No active loan to repay.");
      }

      const next: CreditLineView = {
        ...creditLine,
        borrowedUsdc: Math.max(0, creditLine.borrowedUsdc - amount)
      };
      persist(next);
    },
    [creditLine, persist]
  );

  return {
    creditLine,
    borrow,
    repay
  };
}
