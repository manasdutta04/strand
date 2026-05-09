"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { StrandWalletButton } from "../../components/WalletProvider";

type ByokConfig = {
  provider?: "ollama" | "openai" | "groq" | "gemini" | "claude";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<ByokConfig>({
    provider: "ollama",
    apiKey: "",
    baseUrl: "http://localhost:11434",
    model: "llama3.2-vision"
  });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof ByokConfig>(k: K, v: ByokConfig[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  const { publicKey, signMessage } = useWallet();
  const isOllama = form.provider === "ollama";
  const isCloudProvider = !isOllama;

  async function signByokMessage(wallet: string, ts: number) {
    if (!signMessage) {
      throw new Error("Wallet does not support message signing");
    }
    const message = `Strand BYOK authorization:${wallet}:${ts}`;
    const encoded = new TextEncoder().encode(message);
    const signature = await signMessage(encoded);
    const signatureBase64 = btoa(String.fromCharCode(...signature));
    return {
      message,
      signature: signatureBase64,
      timestamp: ts
    };
  }

  async function saveToCloud() {
    if (!publicKey) {
      setStatus("Connect wallet to save to cloud");
      return;
    }

    try {
      setBusy(true);
      const ts = Date.now();
      const wallet = publicKey.toBase58();
      const auth = await signByokMessage(wallet, ts);

      const resp = await fetch(`/api/byok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          provider: form.provider,
          apiKey: form.apiKey,
          baseUrl: form.baseUrl,
          model: form.model,
          signature: auth.signature,
          message: auth.message,
          timestamp: auth.timestamp
        })
      });

      const j = await resp.json();
      if (!resp.ok) throw new Error(j?.error ?? "save failed");
      setStatus("✓ Saved to cloud successfully");
    } catch (err: any) {
      setStatus("✗ Error: " + (err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  async function clearCloud() {
    if (!publicKey) {
      setStatus("Connect wallet to clear cloud config");
      return;
    }
    try {
      setBusy(true);
      const wallet = publicKey.toBase58();
      const ts = Date.now();
      const auth = await signByokMessage(wallet, ts);
      const resp = await fetch(`/api/byok`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          signature: auth.signature,
          message: auth.message,
          timestamp: auth.timestamp
        })
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j?.error ?? "clear failed");
      setForm({ provider: "ollama", apiKey: "", baseUrl: "http://localhost:11434", model: "llama3.2-vision" });
      setStatus("✓ Cleared from cloud successfully");
    } catch (err: any) {
      setStatus("✗ Error: " + (err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  async function loadFromCloud() {
    if (!publicKey) {
      setStatus("Connect wallet to load cloud config");
      return;
    }
    try {
      setBusy(true);
      const wallet = publicKey.toBase58();
      const ts = Date.now();
      const auth = await signByokMessage(wallet, ts);
      const qs = new URLSearchParams({
        wallet,
        signature: auth.signature,
        message: auth.message,
        timestamp: String(auth.timestamp)
      });
      const resp = await fetch(`/api/byok?${qs.toString()}`);
      const j = await resp.json();
      if (!resp.ok) throw new Error(j?.error ?? "load failed");
      if (!j.row) {
        setStatus("No cloud config found for this wallet");
        return;
      }
      const next: ByokConfig = {
        provider: j.row.provider ?? "ollama",
        apiKey: j.row.api_key ?? "",
        baseUrl: j.row.base_url ?? (j.row.provider === "ollama" ? "http://localhost:11434" : ""),
        model: j.row.model ?? (j.row.provider === "ollama" ? "llama3.2-vision" : "")
      };
      setForm(next);
      setStatus("✓ Loaded from cloud successfully");
    } catch (err: any) {
      setStatus("✗ Error: " + (err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="saas-grid-bg min-h-screen px-4 py-12 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="saas-panel relative z-10 rounded-[28px] p-7 sm:p-8">
          <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Settings</p>
          <h1 className="strand-display mt-4 text-3xl sm:text-4xl" style={{ color: "#EFF4FF" }}>Bring Your Own Key</h1>
          <p className="mt-4 font-mono text-[13px] leading-relaxed text-[#EFF4FF]/75 sm:text-[14px]">
            Use Ollama locally or connect a cloud AI provider. Your wallet is your sign-in. Save & load config securely.
          </p>

          <div className="mt-6">
            <StrandWalletButton className="!h-10 !rounded-xl !text-sm" />
          </div>

          <div className="mt-8 space-y-6">
            {/* Provider Section */}
            <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-5 sm:p-6">
              <h2 className="strand-display text-lg sm:text-xl mb-4" style={{ color: "#EFF4FF" }}>AI Provider</h2>

              <label className="block mb-4">
                <div className="text-sm font-medium font-mono mb-2">Choose Provider</div>
                <select
                  value={form.provider || "ollama"}
                  onChange={(e) => update("provider", e.target.value as any)}
                  className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                >
                  <option value="ollama">Ollama (Local - Free)</option>
                  <option value="openai">OpenAI (Cloud - gpt-4o-mini)</option>
                  <option value="groq">Groq (Cloud - Text Only)</option>
                  <option value="gemini">Gemini (Cloud - Vision)</option>
                  <option value="claude">Anthropic Claude (Cloud - Vision)</option>
                </select>
              </label>

              {/* Ollama Help */}
              {isOllama && (
                <div className="rounded-lg bg-[#6FFF00]/8 border border-[#6FFF00]/22 p-4 text-xs font-mono text-[#EFF4FF]/80">
                  <p><strong>Local Ollama:</strong> Download at <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-[#6FFF00] hover:underline">ollama.com</a>. Then run: <code className="bg-black/30 px-1 rounded">ollama pull llama3.2-vision</code></p>
                </div>
              )}

              {/* Cloud Provider Help */}
              {isCloudProvider && (
                <div className="rounded-lg bg-[#76A9FF]/8 border border-[#76A9FF]/22 p-4 text-xs font-mono text-[#EFF4FF]/80">
                  <p><strong>API Key Required:</strong> Generate at your provider's dashboard. Never share this key.</p>
                </div>
              )}
            </div>

            {/* Config Section */}
            <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-5 sm:p-6">
              <h2 className="strand-display text-lg sm:text-xl mb-4" style={{ color: "#EFF4FF" }}>Configuration</h2>

              {isCloudProvider && (
                <label className="block mb-4">
                  <div className="text-sm font-medium font-mono mb-2">API Key</div>
                  <input
                    type="password"
                    value={form.apiKey || ""}
                    onChange={(e) => update("apiKey", e.target.value)}
                    placeholder="sk-... (kept secure)"
                    className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                  />
                </label>
              )}

              {isOllama && (
                <label className="block mb-4">
                  <div className="text-sm font-medium font-mono mb-2">Ollama Base URL</div>
                  <input
                    value={form.baseUrl || ""}
                    onChange={(e) => update("baseUrl", e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                  />
                </label>
              )}

              <label className="block">
                <div className="text-sm font-medium font-mono mb-2">Model Name</div>
                <input
                  value={form.model || ""}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder={isOllama ? "llama3.2-vision" : "gpt-4o-mini"}
                  className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                />
              </label>
            </div>

            {/* Action Section */}
            <div className="rounded-xl border border-white/10 bg-[#081136]/40 p-5 sm:p-6">
              <h2 className="strand-display text-lg sm:text-xl mb-4" style={{ color: "#EFF4FF" }}>Cloud Sync</h2>
              <p className="font-mono text-xs text-[#EFF4FF]/70 mb-4">Save and load across devices using wallet signature.</p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={saveToCloud}
                  disabled={busy}
                >
                  {busy ? "Saving..." : "Save to Cloud"}
                </button>
                <button
                  type="button"
                  className="btn btn-subtle"
                  onClick={loadFromCloud}
                  disabled={busy}
                >
                  {busy ? "Loading..." : "Load from Cloud"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={clearCloud}
                  disabled={busy}
                >
                  {busy ? "Clearing..." : "Clear Cloud"}
                </button>
              </div>
            </div>

            {/* Status */}
            {status && (
              <div className={`rounded-lg border p-4 font-mono text-sm ${status.includes("✓") ? "bg-[#6FFF00]/8 border-[#6FFF00]/22 text-[#6FFF00]" : "bg-red-500/8 border-red-500/22 text-red-400"}`}>
                {status}
              </div>
            )}
          </div>

          <div className="mt-8 text-xs font-mono text-[#EFF4FF]/70 border-t border-white/10 pt-6">
            <p><strong>Security:</strong> Wallet-signed auth ensures only you access your config. API keys stored in Supabase. For production, keys should be encrypted at rest.</p>
            <p className="mt-2">Questions? See <Link href="/docs" className="text-[#6FFF00] hover:underline">docs</Link> or <Link href="/" className="text-[#6FFF00] hover:underline">home</Link>.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
