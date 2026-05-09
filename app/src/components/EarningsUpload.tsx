"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface EarningsUploadProps {
  platform: string;
  platforms?: Array<{ name: string; label: string }>;
  onPlatformChange?: (platform: string) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (fileName: string) => void;
}

export function EarningsUpload({
  platform,
  platforms = [],
  onPlatformChange,
  onUploadStart,
  onUploadComplete
}: EarningsUploadProps) {
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

  const inputClass =
    "h-11 w-full rounded-md border border-white/20 bg-[#050b2b] px-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition";
  const labelClass = "text-xs font-mono uppercase tracking-[0.08em] text-[#EFF4FF]/75";

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="strand-display text-lg text-[#EFF4FF]">Add Work Record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-1">
              <div className={`${labelClass} mb-2`}>Company</div>
              <select
                value={platform}
                onChange={(e) => onPlatformChange?.(e.target.value)}
                disabled={isLoading}
                className={inputClass}
              >
                {(platforms.length > 0 ? platforms : [{ name: platform, label: platform }]).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-1">
              <div className={`${labelClass} mb-2`}>Work date</div>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                disabled={isLoading}
                className={inputClass}
              />
            </label>
            <div className="hidden md:block" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <div className={`${labelClass} mb-2`}>Earnings (INR)</div>
              <input type="number" min="1" step="1" value={earningsInr} onChange={(e) => setEarningsInr(e.target.value)} placeholder="28540" disabled={isLoading} className={inputClass} />
            </label>
            <label className="block">
              <div className={`${labelClass} mb-2`}>Trips / Orders</div>
              <input type="number" min="1" step="1" value={trips} onChange={(e) => setTrips(e.target.value)} placeholder="342" disabled={isLoading} className={inputClass} />
            </label>
            <label className="block">
              <div className={`${labelClass} mb-2`}>Rating (optional)</div>
              <input type="number" min="0" max="5" step="0.01" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.82" disabled={isLoading} className={inputClass} />
            </label>
            <label className="block md:col-span-2">
              <div className={`${labelClass} mb-2`}>Accepted jobs (optional)</div>
              <input type="number" min="0" step="1" value={accepted} onChange={(e) => setAccepted(e.target.value)} placeholder="336" disabled={isLoading} className={inputClass} />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-4 sm:p-5">
          <label className="block">
            <div className={`${labelClass} mb-2`}>Notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bonuses, settlement notes, payout details..."
              disabled={isLoading}
              rows={4}
              className="w-full rounded-md border border-white/20 bg-[#050b2b] px-3 py-2.5 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
            />
          </label>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !publicKey}
              className="rounded-md border border-[#6FFF00]/65 bg-[#6FFF00]/12 px-4 py-2 font-grotesk text-sm font-medium text-[#EFF4FF] transition hover:bg-[#6FFF00]/20 disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save Record"}
            </button>
            {!publicKey ? <p className="text-xs font-mono text-yellow-400">Connect wallet to save records.</p> : null}
          </div>
        </div>

        {successMessage ? <div className="rounded-lg border border-[#6FFF00]/30 bg-[#6FFF00]/10 px-4 py-3 font-mono text-sm text-[#6FFF00]">{successMessage}</div> : null}
        {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">{error}</div> : null}
      </CardContent>
    </Card>
  );
}
