"use client";

import { FormEvent, useMemo, useState } from "react";

export interface CreditLineView {
  maxUsdc: number;
  apr: number;
  borrowedUsdc: number;
}

interface CreditPanelProps {
  creditLine: CreditLineView | null;
  onBorrow: (amount: number) => Promise<void>;
  onRepay: (amount: number) => Promise<void>;
}

export function CreditPanel({ creditLine, onBorrow, onRepay }: CreditPanelProps) {
  const [borrowInput, setBorrowInput] = useState("200");
  const [repayInput, setRepayInput] = useState("100");
  const [status, setStatus] = useState<string | null>(null);

  const available = useMemo(() => {
    if (!creditLine) {
      return 0;
    }
    return Math.max(0, creditLine.maxUsdc - creditLine.borrowedUsdc);
  }, [creditLine]);

  async function submitBorrow(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const amount = Number(borrowInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatus("Enter a valid borrow amount.");
      return;
    }

    try {
      await onBorrow(amount);
      setStatus("Borrow transaction submitted successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Borrow failed.");
    }
  }

  async function submitRepay(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const amount = Number(repayInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatus("Enter a valid repay amount.");
      return;
    }

    try {
      await onRepay(amount);
      setStatus("Repay transaction submitted successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Repay failed.");
    }
  }

  if (!creditLine) {
    return (
      <section className="panel space-y-4 p-5">
        <h3 className="text-lg font-semibold">No lender has opened a credit line for your score yet.</h3>
        <p className="text-sm text-muted">
          Share your profile to attract lenders. Your live score and work history make underwriting
          portable.
        </p>
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
          Shareable score card ready once your first jobs are completed.
        </div>
      </section>
    );
  }

  return (
    <section className="panel space-y-5 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-muted">Available</div>
        <div className="text-3xl font-semibold text-accent">
          ${available.toLocaleString()} USDC
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-[#151515] p-3">
          <div className="text-muted">APR</div>
          <div className="mt-1 text-lg font-medium">{creditLine.apr.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border bg-[#151515] p-3">
          <div className="text-muted">Current balance</div>
          <div className="mt-1 text-lg font-medium">${creditLine.borrowedUsdc.toLocaleString()} borrowed</div>
        </div>
      </div>

      <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={submitBorrow}>
        <input
          className="w-full rounded-xl border border-border bg-[#101010] px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
          value={borrowInput}
          onChange={(event) => setBorrowInput(event.target.value)}
          inputMode="decimal"
          placeholder="Borrow amount"
        />
        <button className="btn-accent" type="submit" disabled={Number(borrowInput) > available}>
          Borrow USDC
        </button>
      </form>

      <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={submitRepay}>
        <input
          className="w-full rounded-xl border border-border bg-[#101010] px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
          value={repayInput}
          onChange={(event) => setRepayInput(event.target.value)}
          inputMode="decimal"
          placeholder="Repay amount"
        />
        <button className="btn-subtle" type="submit">
          Repay
        </button>
      </form>

      {status ? (
        <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {status}
        </div>
      ) : null}
    </section>
  );
}
