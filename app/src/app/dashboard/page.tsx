"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreditLineView, CreditPanel } from "../../components/CreditPanel";
import { ScoreGauge } from "../../components/ScoreGauge";
import { WorkNFTCard, WorkNFTCardData } from "../../components/WorkNFTCard";
import { useCreditLine } from "../../hooks/useCreditLine";
import { useStrandScore, WorkerStats } from "../../hooks/useStrandScore";
import { useWorkNFTs } from "../../hooks/useWorkNFTs";
import { deriveScoreBreakdown, scoreFromBreakdown, tierFromScore } from "../../lib/score";

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
  const [refreshTick, setRefreshTick] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [demoBorrowedUsdc, setDemoBorrowedUsdc] = useState(300);

  const { score, tier, breakdown, stats } = useStrandScore(wallet, refreshTick);
  const { workNfts } = useWorkNFTs(wallet, refreshTick);
  const { creditLine, borrow, repay } = useCreditLine(wallet, score, refreshTick);

  const demoProfile = useMemo<WorkerStats>(
    () => ({
      jobsDone: 2,
      totalEarnedUsdc: 1800,
      uniqueClients: 2,
      onTimeCompletions: 2,
      memberSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
    }),
    []
  );

  const demoWorkNfts = useMemo<WorkNFTCardData[]>(
    () => [
      {
        client: "8f6MvgGQkW4J2CwQRLjce6aUukTWW6xwRC2d5GWk6Hu6",
        amountUsdc: 950,
        skills: ["Next.js", "UI Design"],
        clientRating: 5,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        explorerUrl: "https://solana.fm/"
      },
      {
        client: "Ez95eoXqyaq3Tz4HuM4Pi8J5ubk6cmDMHqvQ7hccYiS6",
        amountUsdc: 850,
        skills: ["TypeScript", "API Integration"],
        clientRating: 4,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        explorerUrl: "https://solana.fm/"
      }
    ],
    []
  );

  const demoSkills = useMemo<SkillItem[]>(
    () => [
      { name: "Next.js", confidence: 91 },
      { name: "TypeScript", confidence: 88 }
    ],
    []
  );

  const demoBreakdown = useMemo(() => deriveScoreBreakdown(demoProfile), [demoProfile]);
  const demoScore = useMemo(() => scoreFromBreakdown(demoBreakdown), [demoBreakdown]);
  const demoTier = useMemo(() => tierFromScore(demoScore), [demoScore]);

  const demoCreditLine = useMemo<CreditLineView>(
    () => ({
      maxUsdc: demoScore * 10,
      apr: 9.4,
      borrowedUsdc: demoBorrowedUsdc
    }),
    [demoBorrowedUsdc, demoScore]
  );

  const displayStats = demoMode ? demoProfile : stats;
  const displayWorkNfts = demoMode ? demoWorkNfts : workNfts;
  const displaySkills = demoMode ? demoSkills : skills;
  const displayScore = demoMode ? demoScore : score;
  const displayTier = demoMode ? demoTier : tier;
  const displayBreakdown = demoMode ? demoBreakdown : breakdown;
  const displayCreditLine = demoMode ? demoCreditLine : creditLine;

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

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const migratedKey = `strand-demo-cleaned:${wallet}`;
    if (localStorage.getItem(migratedKey) === "1") {
      return;
    }

    const profileKey = `strand-profile:${wallet}`;
    const workNftsKey = `strand-worknfts:${wallet}`;
    const skillsKey = `strand-skills:${wallet}`;
    const creditKey = `strand-credit:${wallet}`;

    const profileRaw = localStorage.getItem(profileKey);
    const nftsRaw = localStorage.getItem(workNftsKey);
    const skillsRaw = localStorage.getItem(skillsKey);

    let shouldClean = false;

    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw) as WorkerStats;
        if (
          parsed.jobsDone === 2 &&
          parsed.totalEarnedUsdc === 1800 &&
          parsed.uniqueClients === 2 &&
          parsed.onTimeCompletions === 2
        ) {
          shouldClean = true;
        }
      } catch {
        // ignore invalid legacy values
      }
    }

    if (!shouldClean && nftsRaw) {
      try {
        const parsed = JSON.parse(nftsRaw) as WorkNFTCardData[];
        const looksLikeLegacyDemo =
          parsed.length === 2 &&
          parsed.some((item) => item.client === "8f6MvgGQkW4J2CwQRLjce6aUukTWW6xwRC2d5GWk6Hu6") &&
          parsed.some((item) => item.client === "Ez95eoXqyaq3Tz4HuM4Pi8J5ubk6cmDMHqvQ7hccYiS6");
        if (looksLikeLegacyDemo) {
          shouldClean = true;
        }
      } catch {
        // ignore invalid legacy values
      }
    }

    if (!shouldClean && skillsRaw) {
      try {
        const parsed = JSON.parse(skillsRaw) as SkillItem[];
        const looksLikeLegacyDemo =
          parsed.length === 2 &&
          parsed.some((item) => item.name === "Next.js" && item.confidence === 91) &&
          parsed.some((item) => item.name === "TypeScript" && item.confidence === 88);
        if (looksLikeLegacyDemo) {
          shouldClean = true;
        }
      } catch {
        // ignore invalid legacy values
      }
    }

    if (shouldClean) {
      localStorage.removeItem(profileKey);
      localStorage.removeItem(workNftsKey);
      localStorage.removeItem(skillsKey);
      localStorage.removeItem(creditKey);
      setSkills([]);
      setRefreshTick((value) => value + 1);
      setDemoStatus("Removed legacy demo data from your account view.");
    }

    localStorage.setItem(migratedKey, "1");
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
    if (demoMode) {
      setShowSkillModal(false);
      setDemoStatus("Demo overlay is active. Turn it off to save skill claims to your account.");
      return;
    }

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
    setRefreshTick((value) => value + 1);
  }

  function runDemoDataSetup(): void {
    setDemoMode((enabled) => !enabled);
    setDemoStatus((current) =>
      demoMode
        ? "Demo overlay is off. You are now viewing your real account data."
        : "Demo overlay is on. No demo data is written to your account."
    );
  }

  async function borrowInDemo(amount: number): Promise<void> {
    const next = Math.min(demoCreditLine.maxUsdc, demoBorrowedUsdc + amount);
    setDemoBorrowedUsdc(next);
  }

  async function repayInDemo(amount: number): Promise<void> {
    setDemoBorrowedUsdc((value) => Math.max(0, value - amount));
  }

  function clearAccountData(): void {
    if (!wallet) {
      return;
    }

    localStorage.removeItem(`strand-profile:${wallet}`);
    localStorage.removeItem(`strand-worknfts:${wallet}`);
    localStorage.removeItem(`strand-skills:${wallet}`);
    localStorage.removeItem(`strand-credit:${wallet}`);
    setSkills([]);
    setRefreshTick((value) => value + 1);
    setDemoStatus("Account-local demo/test data cleared.");
  }

  if (!connected || !wallet) {
    return null;
  }

  const onboarding = [
    { id: "connect", label: "Connect wallet", done: connected, action: () => setActiveTab("history") },
    { id: "first-job", label: "Complete first job", done: displayStats.jobsDone > 0, action: () => setActiveTab("history") },
    { id: "skill", label: "Claim first skill", done: displaySkills.length > 0, action: () => setShowSkillModal(true) },
    { id: "credit", label: "Unlock credit line", done: displayCreditLine !== null, action: () => setActiveTab("credit") }
  ];
  const completedSteps = onboarding.filter((step) => step.done).length;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <ScoreGauge score={displayScore} breakdown={displayBreakdown} />

          <section className="panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-muted">Strand Score</div>
              <span className={`rounded-full px-2 py-1 text-xs ${tierBadgeClass(displayTier)}`}>{displayTier}</span>
            </div>
            <div className="text-3xl font-semibold text-accent">{displayScore}</div>
            <div className="text-sm text-muted">{displayScore} / 1000</div>
          </section>

          <section className="panel p-4 text-sm">
            <div className="mb-2 font-medium">Stats</div>
            <div className="grid grid-cols-2 gap-2 text-muted">
              <div>Jobs done</div>
              <div className="text-right text-primary">{displayStats.jobsDone}</div>
              <div>Total earned</div>
              <div className="text-right text-primary">${displayStats.totalEarnedUsdc.toLocaleString()}</div>
              <div>Unique clients</div>
              <div className="text-right text-primary">{displayStats.uniqueClients}</div>
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
          <div className="mb-5 rounded-xl border border-border bg-[#141414] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">First-Time Setup</h2>
              <span className="rounded-full border border-accent/40 px-2 py-1 text-xs text-accent">
                {completedSteps}/4 done
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {onboarding.map((step, index) => (
                <button
                  key={step.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-[#101010] px-3 py-2 text-left text-sm"
                  onClick={step.action}
                  type="button"
                >
                  <span className="text-muted">
                    {index + 1}. {step.label}
                  </span>
                  <span className={step.done ? "text-accent" : "text-zinc-400"}>{step.done ? "Done" : "Next"}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-accent px-3 py-2 text-sm" onClick={runDemoDataSetup} type="button">
                {demoMode ? "Deactivate Demo Overlay" : "Activate Demo Overlay"}
              </button>
              <button className="btn-subtle px-3 py-2 text-sm" onClick={() => setActiveTab("history")} type="button">
                Open Work History
              </button>
              <button className="btn-subtle px-3 py-2 text-sm" onClick={clearAccountData} type="button">
                Clear Account Test Data
              </button>
            </div>
            {demoStatus ? <p className="mt-2 text-xs text-accent">{demoStatus}</p> : null}
          </div>

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
              {displayWorkNfts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
                  <p className="mb-3">Complete your first job to mint your first Work NFT.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link className="btn-accent px-3 py-2 text-sm" href="/client">
                      Post a Job
                    </Link>
                    <button className="btn-subtle px-3 py-2 text-sm" onClick={runDemoDataSetup} type="button">
                      {demoMode ? "Hide Demo Overlay" : "Preview Demo Overlay"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {displayWorkNfts.map((item) => (
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
              {displaySkills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
                  <p className="mb-3">No verified skills yet. Claim one to trigger oracle verification.</p>
                  <button className="btn-accent px-3 py-2 text-sm" onClick={() => setShowSkillModal(true)} type="button">
                    Add Skill Claim
                  </button>
                </div>
              ) : (
                displaySkills.map((skill) => (
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
            <CreditPanel
              creditLine={displayCreditLine}
              onBorrow={demoMode ? borrowInDemo : borrow}
              onRepay={demoMode ? repayInDemo : repay}
            />
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
