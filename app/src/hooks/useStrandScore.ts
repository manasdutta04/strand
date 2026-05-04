"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getWorkerProfile, getScoreState, WorkerProfile, ScoreState } from "../lib/data";

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

export function useStrandScore(walletAddress?: string | null, refreshToken?: number): StrandScoreState {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [scoreState, setScoreState] = useState<ScoreState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setProfile(null);
      setScoreState(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const wallet = new PublicKey(walletAddress);
        const [prof, score] = await Promise.all([
          getWorkerProfile(wallet),
          getScoreState(wallet)
        ]);
        setProfile(prof);
        setScoreState(score);
      } catch (error) {
        console.error("Failed to fetch strand data:", error);
        setProfile(null);
        setScoreState(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletAddress, refreshToken]);

  const stats = profile ? {
    jobsDone: profile.jobsDone,
    totalEarnedUsdc: profile.totalEarnedUsdc,
    uniqueClients: profile.uniqueClients,
    onTimeCompletions: profile.onTimeCompletions,
    memberSince: profile.memberSince
  } : EMPTY_STATS;

  const score = scoreState?.score || 0;

  const tier = useMemo(() => {
    if (score >= 900) return "Platinum";
    if (score >= 700) return "Gold";
    if (score >= 500) return "Silver";
    if (score >= 300) return "Bronze";
    return "Starter";
  }, [score]);

  return {
    score,
    tier,
    stats,
    isLoading
  };
}
