import { useState, useEffect } from "react";

export interface WorkRecord {
  id: string;
  earning_amount_usdc: number;
  delivery_count: number;
  platform: string;
  created_at: string;
}

export interface ScoreComponents {
  delivery_volume: number;
  earnings_consistency: number;
  tenure: number;
  rating_points: number;
  cross_platform: number;
  repayment: number;
}

export function useWorkerProfile(wallet: string | null, demoMode = false, refreshToken = 0) {
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [scoreComponents, setScoreComponents] = useState<ScoreComponents | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!wallet && !demoMode) {
      setWorkRecords([]);
      setScoreComponents(null);
      setTotalScore(0);
      return;
    }

    let cancelled = false;

    const applyProfile = (payload: {
      workRecords?: WorkRecord[];
      scoreComponents?: ScoreComponents | null;
      totalScore?: number;
    }) => {
      if (cancelled) {
        return;
      }
      setWorkRecords(payload.workRecords ?? []);
      setScoreComponents(payload.scoreComponents ?? null);
      setTotalScore(payload.totalScore ?? 0);
    };

    const fetchProfile = async (initialLoad = false) => {
      if (initialLoad) {
        setIsLoading(true);
      }
      setError(null);

      try {
        if (demoMode) {
          const mockRecords: WorkRecord[] = [
            {
              id: "demo-record-1",
              earning_amount_usdc: 45.5,
              delivery_count: 12,
              platform: "zomato",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "demo-record-2",
              earning_amount_usdc: 38.2,
              delivery_count: 8,
              platform: "swiggy",
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "demo-record-3",
              earning_amount_usdc: 52.75,
              delivery_count: 15,
              platform: "zomato",
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "demo-record-4",
              earning_amount_usdc: 31.4,
              delivery_count: 6,
              platform: "blinkit",
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];

          const mockComponents: ScoreComponents = {
            delivery_volume: 167,
            earnings_consistency: 120,
            tenure: 45,
            rating_points: 187,
            cross_platform: 90,
            repayment: 0
          };

          applyProfile({
            workRecords: mockRecords,
            scoreComponents: mockComponents,
            totalScore:
              mockComponents.delivery_volume +
              mockComponents.earnings_consistency +
              mockComponents.tenure +
              mockComponents.rating_points +
              mockComponents.cross_platform +
              mockComponents.repayment
          });
          return;
        }

        const resp = await fetch(`/api/worker/profile?wallet=${encodeURIComponent(wallet ?? "")}`);
        const payload = await resp.json();

        if (!resp.ok) {
          throw new Error(payload?.error ?? "Failed to fetch worker profile");
        }

        applyProfile({
          workRecords: payload.workRecords ?? [],
          scoreComponents: payload.scoreComponents ?? null,
          totalScore: payload.totalScore ?? 0
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
        }
      } finally {
        if (!cancelled && initialLoad) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile(true);
    const pollTimer = setInterval(() => {
      void fetchProfile(false);
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
    };
  }, [demoMode, wallet, refreshToken]);

  return {
    workRecords,
    scoreComponents,
    totalScore,
    isLoading,
    error
  };
}
