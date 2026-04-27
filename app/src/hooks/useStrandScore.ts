"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ScoreBreakdown,
  deriveScoreBreakdown,
  scoreFromBreakdown,
  tierFromScore
} from "../lib/score";

export interface WorkerStats {
  jobsDone: number;
  totalEarnedUsdc: number;
  uniqueClients: number;
  onTimeCompletions: number;
  memberSince: string;
}

interface StrandScoreState {
  score: number;
  tier: string;
  breakdown: ScoreBreakdown[];
  stats: WorkerStats;
  isLoading: boolean;
}

const EMPTY_STATS: WorkerStats = {
  jobsDone: 0,
  totalEarnedUsdc: 0,
  uniqueClients: 0,
  onTimeCompletions: 0,
  memberSince: new Date().toISOString()
};

export function useStrandScore(walletAddress?: string | null): StrandScoreState {
  const [stats, setStats] = useState<WorkerStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setStats(EMPTY_STATS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const key = `strand-profile:${walletAddress}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        setStats(JSON.parse(saved) as WorkerStats);
      } catch {
        setStats(EMPTY_STATS);
      }
    } else {
      const initialStats: WorkerStats = {
        ...EMPTY_STATS,
        memberSince: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(initialStats));
      setStats(initialStats);
    }

    setIsLoading(false);
  }, [walletAddress]);

  const breakdown = useMemo(() => deriveScoreBreakdown(stats), [stats]);
  const score = useMemo(() => scoreFromBreakdown(breakdown), [breakdown]);

  return {
    score,
    tier: tierFromScore(score),
    breakdown,
    stats,
    isLoading
  };
}
