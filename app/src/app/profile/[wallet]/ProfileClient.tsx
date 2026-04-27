"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkNFTCardData } from "../../../components/WorkNFTCard";
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

  useEffect(() => {
    const profileRaw = localStorage.getItem(`strand-profile:${wallet}`);
    const skillsRaw = localStorage.getItem(`strand-skills:${wallet}`);
    const nftsRaw = localStorage.getItem(`strand-worknfts:${wallet}`);

    if (profileRaw) {
      try {
        setProfile(JSON.parse(profileRaw) as ProfileSnapshot);
      } catch {
        setProfile(EMPTY_PROFILE);
      }
    }

    if (skillsRaw) {
      try {
        setSkills(JSON.parse(skillsRaw) as SkillItem[]);
      } catch {
        setSkills([]);
      }
    }

    if (nftsRaw) {
      try {
        setWorkNfts(JSON.parse(nftsRaw) as WorkNFTCardData[]);
      } catch {
        setWorkNfts([]);
      }
    }
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

  const score = scoreFromBreakdown(breakdown);
  const tier = tierFromScore(score);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-muted">Public profile</div>
          <h1 className="mt-2 text-2xl font-semibold">{truncateWallet(wallet)}</h1>
        </div>
        <div className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">
          Strand Score {score} · {tier}
        </div>
      </header>

      <section className="panel grid gap-4 p-5 sm:grid-cols-4">
        <div>
          <div className="text-xs text-muted">Jobs</div>
          <div className="text-xl font-semibold">{profile.jobsDone}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Earned</div>
          <div className="text-xl font-semibold">${profile.totalEarnedUsdc.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Clients</div>
          <div className="text-xl font-semibold">{profile.uniqueClients}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Member since</div>
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
          {skills.length === 0 ? (
            <p className="text-sm text-muted">No skill attestations yet.</p>
          ) : (
            skills.map((skill) => (
              <article key={skill.name} className="rounded-xl border border-border bg-[#141414] p-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{skill.name}</span>
                  <span className="text-accent">{skill.confidence}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#242424]">
                  <div className="h-full bg-accent" style={{ width: `${skill.confidence}%` }} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="mb-3 text-xl font-semibold">Work history</h2>
        <div className="space-y-2 text-sm">
          {workNfts.length === 0 ? (
            <p className="text-muted">No work records available yet.</p>
          ) : (
            workNfts.map((nft) => (
              <div
                key={`${nft.client}-${nft.completedAt}-${nft.amountUsdc}`}
                className="rounded-lg border border-border bg-[#141414] px-3 py-2"
              >
                ${nft.amountUsdc.toLocaleString()} · {nft.skills.join(", ")} ·{" "}
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
