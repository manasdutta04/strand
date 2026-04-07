"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";

type Step = 1 | 2 | 3 | 4;

export default function ClientPage() {
  const [step, setStep] = useState<Step>(1);
  const [workerWallet, setWorkerWallet] = useState("");
  const [amount, setAmount] = useState("500");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobId] = useState(() => Math.floor(Date.now() / 1000));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = [1, 2, 3, 4] as const;

  const canContinueStep1 = useMemo(() => {
    try {
      if (workerWallet.length === 0) {
        return false;
      }
      new PublicKey(workerWallet);
      return true;
    } catch {
      return false;
    }
  }, [workerWallet]);

  const canContinueStep2 = Number(amount) >= 10;

  function pushSkillFromInput(): void {
    const value = skillInput.trim();
    if (!value || skills.length >= 8 || skills.includes(value)) {
      return;
    }
    setSkills([...skills, value]);
    setSkillInput("");
  }

  function onSkillInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      pushSkillFromInput();
    }
  }

  function postJob(): void {
    setError(null);
    if (!canContinueStep1 || !canContinueStep2 || skills.length === 0) {
      setError("Please complete all fields before posting.");
      return;
    }

    setPosted(true);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-center gap-3">
        {progress.map((value) => (
          <div
            key={value}
            className={`h-2 w-12 rounded-full ${value <= step ? "bg-accent" : "bg-[#2A2A2A]"}`}
          />
        ))}
      </div>

      <section className="panel p-6">
        {step === 1 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Who are you hiring?</h1>
            <input
              value={workerWallet}
              onChange={(event) => setWorkerWallet(event.target.value.trim())}
              placeholder="Worker wallet address"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <button className="btn-accent" disabled={!canContinueStep1} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">How much are you paying?</h1>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="USDC amount"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
              Funds go into escrow. Released when both parties sign completion.
            </div>
            <button className="btn-accent" disabled={!canContinueStep2} onClick={() => setStep(3)}>
              Continue →
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">What skills are required?</h1>
            <input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={onSkillInputKeyDown}
              placeholder="Type skill and press Enter"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent"
                >
                  {skill}
                </span>
              ))}
            </div>
            <button className="btn-accent" disabled={skills.length === 0} onClick={() => setStep(4)}>
              Continue →
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Review & fund</h1>
            <div className="rounded-xl border border-border bg-[#141414] p-4 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2 text-muted">
                <span>Worker</span>
                <span className="text-primary">{workerWallet}</span>
                <span>Amount</span>
                <span className="text-primary">${Number(amount).toLocaleString()} USDC</span>
                <span>Skills</span>
                <span className="text-primary">{skills.join(", ")}</span>
                <span>Job ID</span>
                <span className="text-primary">{jobId}</span>
              </div>
            </div>
            <button className="btn-accent" onClick={postJob}>
              Sign & Fund Escrow
            </button>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {posted ? (
              <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-accent">
                <p className="text-lg">✓ Job posted! Share the job ID with your worker.</p>
                <p className="text-sm">Confetti moment unlocked.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
