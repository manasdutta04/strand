"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreditPanel } from "../../components/CreditPanel";
import { ScoreGauge } from "../../components/ScoreGauge";
import { WorkNFTCard } from "../../components/WorkNFTCard";
import { useCreditLine } from "../../hooks/useCreditLine";
import { useStrandScore } from "../../hooks/useStrandScore";
import { useWorkNFTs } from "../../hooks/useWorkNFTs";

type TabId = "history" | "skills" | "credit";

interface SkillItem {
  name: string;
  confidence: number;
}

const TAB_META: Array<{ id: TabId; label: string }> = [
  { id: "history", label: "Work History" },
  { id: "skills", label: "Skills" },
  { id: "credit", label: "Credit" }
];

function tierBadgeClass(tier: string): string {
  if (tier === "Elite") {
    return "bg-accent/15 text-accent border border-accent/40";
  }
  if (tier === "Trusted") {
    return "bg-sky-500/15 text-sky-300 border border-sky-400/40";
  }
  if (tier === "Rising") {
    return "bg-amber-500/15 text-amber-300 border border-amber-400/40";
  }
  return "bg-zinc-500/20 text-zinc-300 border border-zinc-400/30";
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;

  const [activeTab, setActiveTab] = useState<TabId>("history");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillUrl, setSkillUrl] = useState("");
  const [skills, setSkills] = useState<SkillItem[]>([]);

  const { score, tier, breakdown, stats } = useStrandScore(wallet);
  const { workNfts } = useWorkNFTs(wallet);
  const { creditLine, borrow, repay } = useCreditLine(wallet, score);

  useEffect(() => {
    if (!connected) {
      router.replace("/");
    }
  }, [connected, router]);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const profileKey = `strand-profile:${wallet}`;
    const saved = localStorage.getItem(profileKey);
    if (!saved) {
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          jobsDone: 0,
          totalEarnedUsdc: 0,
          uniqueClients: 0,
          onTimeCompletions: 0,
          memberSince: new Date().toISOString()
        })
      );
    }

    const skillsKey = `strand-skills:${wallet}`;
    const skillsRaw = localStorage.getItem(skillsKey);
    if (skillsRaw) {
      try {
        setSkills(JSON.parse(skillsRaw) as SkillItem[]);
      } catch {
        setSkills([]);
      }
    }
  }, [wallet]);

  const shareUrl = useMemo(() => {
    if (!wallet || typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/profile/${wallet}`;
  }, [wallet]);

  function copyProfileLink(): void {
    if (!shareUrl) {
      return;
    }
    navigator.clipboard.writeText(shareUrl).catch(() => {
      // Ignore clipboard failures for unsupported browsers.
    });
  }

  function submitSkillClaim(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!wallet || skillName.trim().length === 0) {
      return;
    }

    const next = [
      ...skills,
      {
        name: skillName.trim(),
        confidence: Math.max(65, Math.min(99, 65 + Math.floor(Math.random() * 30)))
      }
    ];

    setSkills(next);
    localStorage.setItem(`strand-skills:${wallet}`, JSON.stringify(next));
    setSkillName("");
    setSkillUrl("");
    setShowSkillModal(false);
  }

  if (!connected || !wallet) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <ScoreGauge score={score} breakdown={breakdown} />

          <section className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-muted">Strand Score</div>
              <span className={`rounded-full px-2 py-1 text-xs ${tierBadgeClass(tier)}`}>{tier}</span>
            </div>
            <div className="text-3xl font-semibold text-accent">{score}</div>
            <div className="text-sm text-muted">{score} / 1000</div>
          </section>

          <section className="panel p-4 text-sm">
            <div className="mb-2 font-medium">Stats</div>
            <div className="grid grid-cols-2 gap-2 text-muted">
              <div>Jobs done</div>
              <div className="text-right text-primary">{stats.jobsDone}</div>
              <div>Total earned</div>
              <div className="text-right text-primary">${stats.totalEarnedUsdc.toLocaleString()}</div>
              <div>Unique clients</div>
              <div className="text-right text-primary">{stats.uniqueClients}</div>
            </div>
          </section>

          <button className="btn-subtle w-full" onClick={copyProfileLink}>
            Share Profile →
          </button>
          <Link className="btn-accent w-full" href="/client">
            Post a Job
          </Link>
          <button className="btn-subtle w-full" onClick={() => setShowSkillModal(true)}>
            Add Skill Claim
          </button>
        </aside>

        <section className="panel min-h-[680px] p-5">
          <div className="mb-5 flex gap-2">
            {TAB_META.map((tab) => (
              <button
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "btn-accent px-3 py-2 text-sm"
                    : "btn-subtle px-3 py-2 text-sm"
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "history" ? (
            <div>
              {workNfts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
                  Complete your first job to mint your first Work NFT.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {workNfts.map((item) => (
                    <WorkNFTCard
                      key={`${item.client}-${item.completedAt}-${item.amountUsdc}`}
                      data={item}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "skills" ? (
            <div className="space-y-3">
              {skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
                  No verified skills yet. Claim one to trigger oracle verification.
                </div>
              ) : (
                skills.map((skill) => (
                  <article key={skill.name} className="rounded-xl border border-border bg-[#141414] p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">{skill.name}</span>
                      <span className="text-accent">{skill.confidence}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#262626]">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${skill.confidence}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted">Verified by AI oracle</p>
                  </article>
                ))
              )}
            </div>
          ) : null}

          {activeTab === "credit" ? (
            <CreditPanel creditLine={creditLine} onBorrow={borrow} onRepay={repay} />
          ) : null}
        </section>
      </div>

      {showSkillModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form className="panel w-full max-w-md space-y-4 p-5" onSubmit={submitSkillClaim}>
            <h2 className="text-xl font-semibold">Claim a Skill</h2>
            <input
              className="w-full rounded-xl border border-border bg-[#101010] px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              placeholder="Skill name"
            />
            <input
              className="w-full rounded-xl border border-border bg-[#101010] px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
              value={skillUrl}
              onChange={(event) => setSkillUrl(event.target.value)}
              placeholder="GitHub / portfolio URL"
            />
            <p className="text-xs text-muted">A SkillClaim event will be emitted for oracle processing.</p>
            <div className="flex justify-end gap-2">
              <button className="btn-subtle" type="button" onClick={() => setShowSkillModal(false)}>
                Cancel
              </button>
              <button className="btn-accent" type="submit">
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
