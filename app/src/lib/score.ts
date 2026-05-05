import { WorkerStats } from "../hooks/useStrandScore";

export interface ScoreBreakdown {
  label: string;
  value: number;
  max: number;
}

export function deriveScoreBreakdown(stats: WorkerStats, attestedSkillCount = 0): ScoreBreakdown[] {
  const accountAgeMonths = Math.max(
    0,
    Math.floor((Date.now() - new Date(stats.memberSince).getTime()) / (30 * 24 * 3600 * 1000))
  );

  const volume = Math.floor((Math.min(stats.totalEarnedUsdc, 50_000) * 250) / 50_000);
  const consistency = Math.floor((Math.min(stats.jobsDone, 100) * 250) / 100);
  const diversity = Math.floor((Math.min(stats.uniqueClients, 20) * 150) / 20);
  const longevity = Math.floor((Math.min(accountAgeMonths, 24) * 100) / 24);
  const skills = Math.min(attestedSkillCount * 15, 150);
  const reliability =
    stats.jobsDone === 0 ? 0 : Math.floor((stats.onTimeCompletions * 100) / stats.jobsDone);

  return [
    { label: "Volume", value: volume, max: 250 },
    { label: "Consistency", value: consistency, max: 250 },
    { label: "Diversity", value: diversity, max: 150 },
    { label: "Longevity", value: longevity, max: 100 },
    { label: "Skills", value: skills, max: 150 },
    { label: "Reliability", value: reliability, max: 100 }
  ];
}

export function scoreFromBreakdown(breakdown: ScoreBreakdown[]): number {
  return Math.min(
    1000,
    breakdown.reduce((sum, item) => sum + item.value, 0)
  );
}

export function tierFromScore(score: number): "New" | "Rising" | "Trusted" | "Elite" {
  if (score < 300) {
    return "New";
  }
  if (score < 550) {
    return "Rising";
  }
  if (score < 800) {
    return "Trusted";
  }
  return "Elite";
}

export function aprFromScore(score: number): number {
  const normalized = Math.max(0, Math.min(1000, score));
  return 24 - (normalized / 1000) * 12;
}
