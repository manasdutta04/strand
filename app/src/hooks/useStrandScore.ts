"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deriveScoreBreakdown,
  scoreFromBreakdown,
  tierFromScore
} from "../lib/score";
import { getScoreState, getWorkerProfile, listSkillAttestations } from "../lib/data-access";

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
  error: string | null;
}

const EMPTY_STATS: WorkerStats = {
  jobsDone: 0,
  totalEarnedUsdc: 0,
  uniqueClients: 0,
  onTimeCompletions: 0,
  memberSince: new Date().toISOString()
};

export function useStrandScore(walletAddress?: string | null, refreshToken?: number): StrandScoreState {
  const [stats, setStats] = useState<WorkerStats>(EMPTY_STATS);
  const [chainScore, setChainScore] = useState<number | null>(null);
  const [attestedSkillCount, setAttestedSkillCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setStats(EMPTY_STATS);
      setChainScore(null);
      setAttestedSkillCount(0);
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
        const profile = await getWorkerProfile(walletAddressSafe);
        const scoreState = await getScoreState(walletAddressSafe);
        const skills = await listSkillAttestations(walletAddressSafe);
        if (cancelled) {
          return;
        }

        setStats(
          profile
            ? {
                jobsDone: profile.jobsDone,
                totalEarnedUsdc: profile.totalEarnedUsdc,
                uniqueClients: profile.uniqueClients,
                onTimeCompletions: profile.onTimeCompletions,
                memberSince: profile.memberSince
              }
            : EMPTY_STATS
        );
        setChainScore(scoreState?.score ?? null);
        setAttestedSkillCount(skills.filter((skill) => skill.confidence >= 65).length);
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load worker profile";
          setError(errorMessage);
          setStats(EMPTY_STATS);
          setChainScore(null);
          setAttestedSkillCount(0);
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

  const breakdown = useMemo(
    () => deriveScoreBreakdown(stats, attestedSkillCount),
    [attestedSkillCount, stats]
  );
  const fallbackScore = useMemo(() => scoreFromBreakdown(breakdown), [breakdown]);
  const score = chainScore ?? fallbackScore;

  return {
    score,
    tier: tierFromScore(score),
    stats,
    isLoading,
    error
  };
}
