"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";

interface SkillItem {
  name: string;
  confidence: number;
}

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerSkillsPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [skills, setSkills] = useState<SkillItem[]>([]);

  useEffect(() => {
    if (!wallet) {
      setSkills([]);
      return;
    }
    const raw = localStorage.getItem(`strand-skills:${wallet}`);
    if (!raw) {
      setSkills([]);
      return;
    }
    try {
      setSkills(JSON.parse(raw) as SkillItem[]);
    } catch {
      setSkills([]);
    }
  }, [wallet]);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Skill Attestations"
        subtitle="Track oracle-verified competencies used in score composition."
        nav={NAV}
      >
        <section className="panel p-4">
        {skills.length === 0 ? (
          <p className="text-sm text-muted">No verified skills yet.</p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <article key={skill.name} className="rounded-lg border border-border bg-[#141414] p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-accent">{skill.confidence}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#242424]">
                  <div className="h-full bg-accent" style={{ width: `${skill.confidence}%` }} />
                </div>
              </article>
            ))}
          </div>
        )}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
