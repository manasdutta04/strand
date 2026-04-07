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
- **Gotchas discovered:** <!-- update as you find them -->

## Anchor (Solana program framework)
- **Version:** 0.31.x
- **CLI:** `anchor build`, `anchor deploy`, `anchor test`
- **IDL output:** `target/idl/*.json` — import into frontend via `@coral-xyz/anchor`
- **Devnet USDC mint:** `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr`
- **Gotchas discovered:** <!-- update as you find them -->

## Solana Web3.js + Wallet Adapter
- **@solana/web3.js:** v1.x (not v2 — breaking changes)
- **@solana/wallet-adapter-react:** standard Phantom + Backpack support
- **@solana/spl-token:** for USDC ATA creation and transfers
- **Gotchas discovered:** <!-- update as you find them -->

## Frontend Stack
- **Next.js:** 14 (App Router)
- **TypeScript:** strict mode
- **Tailwind CSS:** v3
- **Gotchas discovered:** <!-- update as you find them -->

---
*Last updated: 2026-04-07 08:42 IST*
