"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface EarningsUploadProps {
  platform: string;
  onUploadStart?: () => void;
  onUploadComplete?: (fileName: string) => void;
}

export function EarningsUpload({ platform, onUploadStart, onUploadComplete }: EarningsUploadProps) {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [workDate, setWorkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [earningsInr, setEarningsInr] = useState("");
  const [trips, setTrips] = useState("");
  const [rating, setRating] = useState("");
  const [accepted, setAccepted] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave(): Promise<void> {
    if (!publicKey) {
      setError("Please connect wallet first.");
      return;
    }

    const amount = Number(earningsInr);
    const deliveryCount = Number(trips);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid earnings amount in INR.");
      return;
    }
    if (!Number.isFinite(deliveryCount) || deliveryCount <= 0) {
      setError("Enter a valid trips/orders count.");
      return;
    }
    if (!workDate) {
      setError("Select a valid date.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    onUploadStart?.();

    try {
      const form = new FormData();
      form.append("wallet", publicKey.toBase58());
      form.append("platform", platform);
      form.append("manualAmountInr", String(amount));
      form.append("manualDeliveries", String(deliveryCount));
      form.append("manualDate", workDate);
      if (rating.trim()) form.append("manualRating", rating.trim());
      if (accepted.trim()) form.append("manualAccepted", accepted.trim());
      if (notes.trim()) form.append("manualNotes", notes.trim());

      const resp = await fetch("/api/worker/upload", {
        method: "POST",
        body: form
      });
      const payload = (await resp.json()) as { ok?: boolean; error?: string; row?: { id?: string } };
      if (!resp.ok || payload?.ok === false) {
        throw new Error(payload?.error ?? "Failed to save record");
      }

      setSuccessMessage("Saved successfully.");
      onUploadComplete?.(payload?.row?.id ?? "manual-record");
      setEarningsInr("");
      setTrips("");
      setRating("");
      setAccepted("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add work record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Work date</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Earnings (INR)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={earningsInr}
              onChange={(e) => setEarningsInr(e.target.value)}
              placeholder="28540"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Trips / Orders</label>
            <input
              type="number"
              min="1"
              step="1"
              value={trips}
              onChange={(e) => setTrips(e.target.value)}
              placeholder="342"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Rating (optional)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.01"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4.82"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Accepted jobs (optional)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={accepted}
              onChange={(e) => setAccepted(e.target.value)}
              placeholder="336"
              disabled={isLoading}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bonuses, settlement notes, payout details..."
            disabled={isLoading}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !publicKey}
            className="rounded-md border border-[#6FFF00]/60 bg-[#6FFF00]/10 px-4 py-2 text-sm font-medium text-[#EAF2FF] hover:bg-[#6FFF00]/20 disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          {!publicKey ? (
            <p className="text-xs text-yellow-400">Connect wallet to save records.</p>
          ) : null}
        </div>

        {successMessage ? <p className="text-sm text-green-400">{successMessage}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
