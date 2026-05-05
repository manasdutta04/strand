# Strand — API & Library Reference

## Oracle providers (pluggable skill oracle)
- **Default for local development:** Ollama running on `http://localhost:11434`
- **Cloud providers supported through user-supplied API keys:** OpenAI, Groq, Gemini, Claude/Anthropic
- **Provider selection:** set `LLM_PROVIDER` to `ollama`, `openai`, `groq`, `gemini`, or `claude`
- **Keys:**
  - OpenAI: `OPENAI_API_KEY`
  - Groq: `GROQ_API_KEY`
  - Gemini: `GEMINI_API_KEY`
  - Claude: `ANTHROPIC_API_KEY`
- **Models:** provider-specific defaults live in `oracle/.env.example` and `scripts/setup-oracle-env.mjs`
- **Deployment note:** the oracle stays server-side; never expose provider keys to the frontend
- **Gotcha:** keep local Ollama optional, not required, so the SaaS path works for users who only bring API keys

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
