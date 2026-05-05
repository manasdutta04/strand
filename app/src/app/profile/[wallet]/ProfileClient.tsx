"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkNFTCardData } from "../../../components/WorkNFTCard";
import {
  getScoreState,
  getWorkerProfile,
  listSkillAttestations,
  listWorkNfts
} from "../../../lib/data-access";
import { ScoreBreakdown, scoreFromBreakdown, tierFromScore } from "../../../lib/score";

interface SkillItem {
  name: string;
  confidence: number;
}

interface ProfileSnapshot {
  jobsDone: number;
  totalEarnedUsdc: number;
  uniqueClients: number;
  memberSince: string;
}

const EMPTY_PROFILE: ProfileSnapshot = {
  jobsDone: 0,
  totalEarnedUsdc: 0,
  uniqueClients: 0,
  memberSince: new Date().toISOString()
};

function truncateWallet(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export default function ProfileClient({ wallet }: { wallet: string }) {
  const [profile, setProfile] = useState<ProfileSnapshot>(EMPTY_PROFILE);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [workNfts, setWorkNfts] = useState<WorkNFTCardData[]>([]);
  const [chainScore, setChainScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const [profileState, scoreState, skillStates, nftStates] = await Promise.all([
          getWorkerProfile(wallet),
          getScoreState(wallet),
          listSkillAttestations(wallet),
          listWorkNfts(wallet)
        ]);

        if (cancelled) {
          return;
        }

        setProfile(
          profileState
            ? {
                jobsDone: profileState.jobsDone,
                totalEarnedUsdc: profileState.totalEarnedUsdc,
                uniqueClients: profileState.uniqueClients,
                memberSince: profileState.memberSince
              }
            : EMPTY_PROFILE
        );
        setChainScore(scoreState?.score ?? null);
        setSkills(
          skillStates.map((skill) => ({
            name: skill.name,
            confidence: skill.confidence
          }))
        );
        setWorkNfts(nftStates as WorkNFTCardData[]);
      } catch {
        if (!cancelled) {
          setProfile(EMPTY_PROFILE);
          setChainScore(null);
          setSkills([]);
          setWorkNfts([]);
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
  }, [wallet]);

  const breakdown: ScoreBreakdown[] = useMemo(
    () => [
      {
        label: "Volume",
        value: Math.floor((Math.min(profile.totalEarnedUsdc, 50_000) * 250) / 50_000),
        max: 250
      },
      {
        label: "Consistency",
        value: Math.floor((Math.min(profile.jobsDone, 100) * 250) / 100),
        max: 250
      },
      {
        label: "Diversity",
        value: Math.floor((Math.min(profile.uniqueClients, 20) * 150) / 20),
        max: 150
      },
      {
        label: "Longevity",
        value: 10,
        max: 100
      },
      {
        label: "Skills",
        value: Math.min(skills.length * 15, 150),
        max: 150
      },
      {
        label: "Reliability",
        value: profile.jobsDone > 0 ? 100 : 0,
        max: 100
      }
    ],
    [profile.jobsDone, profile.totalEarnedUsdc, profile.uniqueClients, skills.length]
  );

  const score = chainScore ?? scoreFromBreakdown(breakdown);
  const tier = tierFromScore(score);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Public profile</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{truncateWallet(wallet)}</h1>
        </div>
        <div className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          {isLoading ? "Loading score..." : `Strand Score ${score} • ${tier}`}
        </div>
      </header>

      <section className="panel grid gap-4 p-5 sm:grid-cols-4">
        <div>
          <div className="text-xs text-muted-foreground">Jobs</div>
          <div className="text-xl font-semibold">{profile.jobsDone}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Earned</div>
          <div className="text-xl font-semibold">${profile.totalEarnedUsdc.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Clients</div>
          <div className="text-xl font-semibold">{profile.uniqueClients}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Member since</div>
          <div className="text-xl font-semibold">
            {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
              new Date(profile.memberSince)
            )}
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-xl font-semibold">Skills</h2>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading skill attestations...</p>
          ) : skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skill attestations yet.</p>
          ) : (
            skills.map((skill) => (
              <article key={skill.name} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{skill.name}</span>
                  <span className="text-muted-foreground">{skill.confidence}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-foreground" style={{ width: `${skill.confidence}%` }} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-xl font-semibold">Work history</h2>
        <div className="space-y-2 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Loading work records...</p>
          ) : workNfts.length === 0 ? (
            <p className="text-muted-foreground">No work records available yet.</p>
          ) : (
            workNfts.map((nft) => (
              <div
                key={`${nft.client}-${nft.completedAt}-${nft.amountUsdc}`}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                ${nft.amountUsdc.toLocaleString()} - {nft.skills.join(", ") || "No skills tagged"} -{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                }).format(new Date(nft.completedAt))}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
