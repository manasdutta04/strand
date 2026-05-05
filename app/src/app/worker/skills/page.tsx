"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { useSkills } from "../../../hooks/useSkills";
import { Card, CardContent } from "../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerSkillsPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { skills, isLoading } = useSkills(wallet);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Skill Attestations"
        subtitle="Track oracle-verified competencies used in score composition."
        nav={NAV}
      >
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading skills...</p>
            ) : skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No verified skills yet.</p>
            ) : (
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="rounded-lg border bg-muted/50 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-accent">{skill.confidence}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${skill.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SaasShell>
    </RequireWallet>
  );
}
