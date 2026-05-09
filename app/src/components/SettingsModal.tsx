"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

type ByokConfig = {
  provider?: "ollama" | "openai" | "groq" | "gemini" | "claude";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // Mounted state for portal rendering - must be before any conditional returns
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState<ByokConfig>({
    provider: "ollama",
    apiKey: "",
    baseUrl: "http://localhost:11434",
    model: "llama3.2-vision"
  });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const { publicKey, signMessage } = useWallet();
  const isOllama = form.provider === "ollama";
  const isCloudProvider = !isOllama;

  // Fetch available Ollama models from user's device
  useEffect(() => {
    if (isOllama && isOpen) {
      fetchOllamaModels();
    }
  }, [isOllama, isOpen]);

  // Clear model when switching away from Ollama (cloud providers infer model from API key)
  useEffect(() => {
    if (isCloudProvider && form.model) {
      setForm((s) => ({ ...s, model: "" }));
    }
  }, [isCloudProvider]);

  async function fetchOllamaModels() {
    setLoadingModels(true);
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        method: "GET"
      });
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        setOllamaModels(models);
      } else {
        setOllamaModels([]);
      }
    } catch (err) {
      // Ollama not running
      setOllamaModels([]);
    } finally {
      setLoadingModels(false);
    }
  }

  function update<K extends keyof ByokConfig>(k: K, v: ByokConfig[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

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

      let errorMsg = "save failed";
      if (!resp.ok) {
        try {
          const j = await resp.json();
          errorMsg = j?.error ?? `HTTP ${resp.status}`;
        } catch {
          errorMsg = `HTTP ${resp.status}: ${resp.statusText || "Server error"}`;
        }
        throw new Error(errorMsg);
      }
      setStatus("✓ Saved to cloud successfully");
    } catch (err: any) {
      setStatus("✗ Error: " + (err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  async function loadFromCloud() {
    if (!publicKey) {
      setStatus("Connect wallet to load config");
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
      
      let errorMsg = "load failed";
      if (!resp.ok) {
        try {
          const j = await resp.json();
          errorMsg = j?.error ?? `HTTP ${resp.status}`;
        } catch {
          errorMsg = `HTTP ${resp.status}: ${resp.statusText || "Server error"}`;
        }
        throw new Error(errorMsg);
      }
      
      const j = await resp.json();
      if (!j.row) {
        setStatus("No config found for this wallet");
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

  async function clearFromCloud() {
    if (!publicKey) {
      setStatus("Connect wallet to clear config");
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

      let errorMsg = "clear failed";
      if (!resp.ok) {
        try {
          const j = await resp.json();
          errorMsg = j?.error ?? `HTTP ${resp.status}`;
        } catch {
          errorMsg = `HTTP ${resp.status}: ${resp.statusText || "Server error"}`;
        }
        throw new Error(errorMsg);
      }
      setForm({ provider: "ollama", apiKey: "", baseUrl: "http://localhost:11434", model: "llama3.2-vision" });
      setStatus("✓ Cleared from cloud successfully");
    } catch (err: any) {
      setStatus("✗ Error: " + (err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="saas-panel relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Settings</p>
        <h1 className="strand-display mt-4 text-3xl sm:text-4xl" style={{ color: "#EFF4FF" }}>Bring Your Own Key</h1>
        <p className="mt-4 font-mono text-[13px] leading-relaxed text-[#EFF4FF]/75 sm:text-[14px]">
          Use Ollama locally or connect a cloud AI provider. Your wallet is your sign-in. Save & load config securely.
        </p>

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

            {isOllama ? (
              <label className="block">
                <div className="text-sm font-medium font-mono mb-2">
                  Model Name
                  {loadingModels && <span className="text-[#6FFF00] text-xs ml-2">(discovering...)</span>}
                  {!loadingModels && ollamaModels.length > 0 && <span className="text-[#6FFF00] text-xs ml-2">({ollamaModels.length} found)</span>}
                </div>
                {ollamaModels.length > 0 ? (
                  <select
                    value={form.model || ""}
                    onChange={(e) => update("model", e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                  >
                    <option value="">Select a model...</option>
                    {ollamaModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.model || ""}
                    onChange={(e) => update("model", e.target.value)}
                    placeholder="llama3.2-vision"
                    className="w-full rounded-lg border border-white/20 bg-[#050b2b] px-4 py-3 text-[#EFF4FF] font-mono text-sm hover:border-white/30 focus:border-[#6FFF00] focus:outline-none transition"
                  />
                )}
              </label>
            ) : (
              <div className="text-sm font-mono text-[#EFF4FF]/75">
                <strong>Model:</strong> This provider determines the model from your API key. No model input is required.
              </div>
            )}
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
                onClick={clearFromCloud}
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
          <p className="mt-2">Questions? See <Link href="/docs" className="text-[#6FFF00] hover:underline">docs</Link>.</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
