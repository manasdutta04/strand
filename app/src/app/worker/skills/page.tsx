"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../components/RequireWallet";
import { SaasShell } from "../../../components/SaasShell";
import { formatErrorMessage } from "../../../lib/error-formatter";
import { useWorkerProfile } from "../../../hooks/useWorkerProfile";

const NAV = [
  { label: "Overview", href: "/worker/dashboard" },
  { label: "Work History", href: "/worker/work" },
  { label: "Skills", href: "/worker/skills" },
  { label: "Credit", href: "/worker/credit" }
];

export default function WorkerSkillsPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { skills, isLoading, error } = useWorkerProfile(wallet, false);

  return (
    <RequireWallet redirectTo="/login/worker">
      <SaasShell
        productLabel="Worker Workspace"
        title="Build Your Reputation"
        subtitle="Verified skills and attestations - trusted expertise signals."
        nav={NAV}
        showSettings={true}
      >
        <section className="panel p-4">
          {error ? (
            <p className="text-sm text-red-600">{formatErrorMessage(error.message)}</p>
          ) : isLoading ? (
            <p className="text-sm text-muted">Loading verified skills...</p>
          ) : skills.length === 0 ? (
            <p className="text-sm text-muted">No verified skills yet.</p>
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <article key={skill.name} className="rounded-lg border border-border bg-[#141414] p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{skill.name}</span>
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
