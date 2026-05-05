"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { RequireWallet } from "../../../../components/RequireWallet";
import { SaasShell } from "../../../../components/SaasShell";
import { DEVNET_USDC_MINT } from "../../../../lib/constants";
import { executeCreateJob } from "../../../../lib/tx-helpers";

type Step = 1 | 2 | 3 | 4;

const NAV = [
  { label: "Overview", href: "/client/dashboard" },
  { label: "Create Job", href: "/client/jobs/new" }
];

export default function CreateClientJobPage() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState<Step>(1);
  const [workerWallet, setWorkerWallet] = useState("");
  const [amount, setAmount] = useState("500");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobId] = useState(() => Math.floor(Date.now() / 1000));
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

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

  async function postJob(): Promise<void> {
    setError(null);
    setSignature(null);

    if (!canContinueStep1 || !canContinueStep2 || skills.length === 0) {
      setError("Please complete all fields before posting.");
      return;
    }
    if (!publicKey || !sendTransaction) {
      setError("Connect your wallet before submitting the job.");
      return;
    }

    try {
      setIsSending(true);
      const workerPublicKey = new PublicKey(workerWallet);
      const clientTokenAccount = await getAssociatedTokenAddress(
        DEVNET_USDC_MINT,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const result = await executeCreateJob(
        {
          connection,
          walletPublicKey: publicKey,
          sendTransaction
        },
        {
          jobId,
          worker: workerPublicKey,
          amountUsdc: Number(amount),
          skillsRequired: skills,
          clientTokenAccount
        }
      );

      setPosted(true);
      setSignature(result.signature);
    } catch (maybeError) {
      const errorMessage = maybeError instanceof Error ? maybeError.message : String(maybeError);
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <RequireWallet redirectTo="/login/client">
      <SaasShell
        productLabel="Client Workspace"
        title="Create Job"
        subtitle="Define the worker, escrow amount, and required skills."
        nav={NAV}
      >
        <section className="panel p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Select worker wallet</h2>
              <input
                value={workerWallet}
                onChange={(event) => setWorkerWallet(event.target.value.trim())}
                placeholder="Worker wallet address"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button className="btn-accent" disabled={!canContinueStep1} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Set escrow amount</h2>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="USDC amount"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button className="btn-accent" disabled={!canContinueStep2} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Set required skills</h2>
              <input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={onSkillInputKeyDown}
                placeholder="Type skill and press Enter"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
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
              <h2 className="text-xl font-semibold tracking-tight">Review and submit</h2>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                Worker: {workerWallet}
                <br />
                Amount: ${Number(amount).toLocaleString()} USDC
                <br />
                Skills: {skills.join(", ")}
                <br />
                Job ID: {jobId}
              </div>
              <button className="btn-accent" disabled={isSending} onClick={postJob}>
                {isSending ? "Signing transaction…" : "Sign And Fund Escrow"}
              </button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {signature ? (
                <p className="text-sm text-muted-foreground">
                  Job created on-chain: <a className="underline" href={`https://solana.fm/tx/${signature}`} target="_blank" rel="noreferrer">{signature.slice(0, 10)}…</a>
                </p>
              ) : null}
              {posted && !signature ? <p className="text-sm text-muted-foreground">Transaction submitted. Waiting for confirmation…</p> : null}
            </div>
          ) : null}
        </section>
      </SaasShell>
    </RequireWallet>
  );
}
