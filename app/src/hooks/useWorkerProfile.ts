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

export function useWorkerProfile(wallet: string | null, demoMode = false) {
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

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would fetch from the Solana blockchain.
        // Demo mode keeps the product explorable without seeded on-chain data.
        const mockRecords: WorkRecord[] = demoMode
          ? [
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
            ]
          : [];

        const mockComponents: ScoreComponents | null = demoMode
          ? {
              delivery_volume: 167,
              earnings_consistency: 120,
              tenure: 45,
              rating_points: 187,
              cross_platform: 90,
              repayment: 0
            }
          : null;

        setWorkRecords(mockRecords);
        setScoreComponents(mockComponents);
        setTotalScore(
          mockComponents
            ? mockComponents.delivery_volume +
              mockComponents.earnings_consistency +
              mockComponents.tenure +
              mockComponents.rating_points +
              mockComponents.cross_platform +
              mockComponents.repayment
            : 0
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [demoMode, wallet]);

  return {
    workRecords,
    scoreComponents,
    totalScore,
    isLoading,
    error
  };
}
