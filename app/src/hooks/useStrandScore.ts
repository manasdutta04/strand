"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ScoreBreakdown,
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

export function useStrandScore(walletAddress?: string | null, refreshToken?: number): StrandScoreState {
  const [stats, setStats] = useState<WorkerStats>(EMPTY_STATS);
  const [chainScore, setChainScore] = useState<number | null>(null);
  const [attestedSkillCount, setAttestedSkillCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setStats(EMPTY_STATS);
      setChainScore(null);
      setAttestedSkillCount(0);
      setIsLoading(false);
      return;
    }
    const walletAddressSafe = walletAddress;

    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const profile = await getWorkerProfile(walletAddressSafe);
        const scoreState = await getScoreState(walletAddressSafe);
        const skills = await listSkillAttestations(walletAddressSafe);
        if (cancelled) {
          return;
        }

        if (profile) {
          setStats({
            jobsDone: profile.jobsDone,
            totalEarnedUsdc: profile.totalEarnedUsdc,
            uniqueClients: profile.uniqueClients,
            onTimeCompletions: profile.onTimeCompletions,
            memberSince: profile.memberSince
          });
        } else {
          setStats(EMPTY_STATS);
        }

        if (!profile && !scoreState) {
          setStats(EMPTY_STATS);
        }

        setChainScore(scoreState?.score ?? null);
        setAttestedSkillCount(skills.filter((skill) => skill.confidence >= 65).length);
      } catch {
        if (!cancelled) {
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
    breakdown,
    stats,
    isLoading
  };
}
