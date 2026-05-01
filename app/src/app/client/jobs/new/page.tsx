"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { RequireWallet } from "../../../../components/RequireWallet";
import { SaasShell } from "../../../../components/SaasShell";

type Step = 1 | 2 | 3 | 4;

const NAV = [
  { label: "Overview", href: "/client/dashboard" },
  { label: "Create Job", href: "/client/jobs/new" }
];

export default function CreateClientJobPage() {
  const [step, setStep] = useState<Step>(1);
  const [workerWallet, setWorkerWallet] = useState("");
  const [amount, setAmount] = useState("500");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobId] = useState(() => Math.floor(Date.now() / 1000));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <RequireWallet redirectTo="/login/client">
      <SaasShell
        productLabel="Client Workspace"
        title="Create Job"
        subtitle="Define the worker, escrow amount, and required skill tags."
        nav={NAV}
      >
        <section className="panel p-5">
        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select worker wallet</h2>
            <input
              value={workerWallet}
              onChange={(event) => setWorkerWallet(event.target.value.trim())}
              placeholder="Worker wallet address"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <button className="btn-accent" disabled={!canContinueStep1} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Set escrow amount</h2>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="USDC amount"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <button className="btn-accent" disabled={!canContinueStep2} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Set required skills</h2>
            <input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={onSkillInputKeyDown}
              placeholder="Type skill and press Enter"
              className="w-full rounded-xl border border-border bg-[#101010] px-4 py-3 text-sm outline-none ring-accent/30 transition focus:ring"
            />
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent">
                  {skill}
                </span>
              ))}
            </div>
            <button className="btn-accent" disabled={skills.length === 0} onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review and submit</h2>
            <div className="rounded-xl border border-border bg-[#141414] p-4 text-sm">
              Worker: {workerWallet}
              <br />
              Amount: ${Number(amount).toLocaleString()} USDC
              <br />
              Skills: {skills.join(", ")}
              <br />
              Job ID: {jobId}
            </div>
            <button className="btn-accent" onClick={postJob}>
              Sign And Fund Escrow
            </button>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {posted ? <p className="text-sm text-accent">Job created. Share Job ID with the worker.</p> : null}
          </div>
        ) : null}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
