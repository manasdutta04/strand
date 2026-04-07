# Strand — API & Library Reference

## Ollama (local LLM — skill oracle)
- **What:** Local inference server, no API key, no cost, works offline
- **Install:** `curl -fsSL https://ollama.com/install.sh | sh`
- **Model for skill grading:** `llama3.2` (fast) or `mistral` (more accurate)
  - Pull command: `ollama pull llama3.2`
- **Base URL:** `http://localhost:11434`
- **API endpoint:** `POST http://localhost:11434/api/generate`
- **Request format:**
```json
  {
    "model": "llama3.2",
    "prompt": "...",
    "stream": false,
    "format": "json"
  }
```
- **Response:** `{ "response": "{ json string here }" }`
- **Important:** Always set `stream: false` for oracle use. Parse `response` field as JSON.
- **Timeout:** Set 30s timeout — local models can be slow on first load
- **Gotchas discovered:** If Ollama daemon is not running, `ollama list` can still print model metadata but HTTP calls to `localhost:11434` will fail until `ollama serve` is active.

## Anchor (Solana program framework)
- **Version:** 0.31.x
- **CLI:** `anchor build`, `anchor deploy`, `anchor test`
- **IDL output:** `target/idl/*.json` — import into frontend via `@coral-xyz/anchor`
- **Devnet USDC mint:** `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr`
- **Gotchas discovered:** PDA seeds are capped at 32 bytes per seed; dynamic strings used as seeds (e.g., `skill_tag`) must be length-limited or pre-hashed.

## Solana Web3.js + Wallet Adapter
- **@solana/web3.js:** v1.x (not v2 — breaking changes)
- **@solana/wallet-adapter-react:** standard Phantom + Backpack support
- **@solana/spl-token:** for USDC ATA creation and transfers
- **Gotchas discovered:** <!-- update as you find them -->

## Frontend Stack
- **Next.js:** 14 (App Router)
- **TypeScript:** strict mode
- **Tailwind CSS:** v3
- **Gotchas discovered:** Next.js 14 build on Node.js v24 can fail with React server runtime errors; prefer Node.js 20 LTS for stable CI builds.

---
*Last updated: 2026-04-07 09:19 IST*
