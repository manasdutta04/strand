# Strand - Portable Work History & Credit Protocol

> Your wallet is your résumé. Your work history is your credit score.

## The Problem
Gig work is massive, but reputation is still trapped inside closed platforms. More than 1.5 billion workers cannot carry verified proof of completed work between marketplaces, so they repeatedly start from zero. Without portable work history, most freelancers also have no path to undercollateralized credit.

## What Strand Does
- Work NFTs: Every completed job mints a dual-signed on-chain work record owned by the worker wallet.
- Strand Score: A transparent 0-1000 on-chain reputation score updates from verified work and consistency.
- AI-verified skills via a pluggable oracle: Skill claims are graded through Ollama locally or via user-provided API keys for OpenAI, Groq, Gemini, or Claude.
- Credit layer: Lenders read score accounts on Solana to open USDC credit lines and enable borrowing.

## Why This Wins
1. Functionality first: End-to-end protocol architecture spans job escrow, score computation, oracle attestations, and credit lines.
2. Composable impact: `strand-score` is a standalone primitive any Solana lending app can CPI into.
3. Novel UX + business fit: Wallet-native profiles and instant share links solve user trust and lender underwriting at the same time.

## Architecture
```text
User (Phantom wallet)
│
├─► strand-core ──CPI──► strand-score (triggered on job completion)
│       │
│       └─► JobEscrow (USDC SPL token account, PDA-owned)
│
├─► strand-score ──read──► strand-credit (score check before borrow)
│       │
│       └─► Oracle service (off-chain Node.js service)
│               ├─► Ollama: POST http://localhost:11434/api/generate
│               └─► Cloud providers via user-supplied API keys
│
└─► strand-credit
└─► Lender Vault (USDC SPL token account, PDA-owned)
```

## SaaS App Routing (Frontend)

The frontend is now role-oriented and multi-page:

- Landing and role entry:
  - `/` role selection hub
  - `/login/worker`
  - `/login/client`
  - `/login/lender`

- Worker workspace:
  - `/worker/dashboard` overview
  - `/worker/work`
  - `/worker/skills`
  - `/worker/credit`

- Client workspace:
  - `/client/dashboard`
  - `/client/jobs/new`

- Lender workspace:
  - `/lender/dashboard`
  - `/lender/dashboard/queue`

## Quick Start
1. Install prerequisites: Node.js 18+, Rust 1.75+, Solana CLI 1.18+, Anchor 0.31.x.
2. Choose an oracle provider:
	- Local Ollama: install Ollama and run `ollama pull llama3.2`
	- Cloud mode: set `LLM_PROVIDER` to `openai`, `groq`, `gemini`, or `claude`, then provide the matching API key in `oracle/.env`
3. Configure Solana to devnet:
	- `solana config set --url devnet`
4. Install dependencies:
	- `npm install`
5. Build programs:
	- `anchor build`
6. Configure oracle provider and keys:
	- Run `npm run setup:oracle-env`
	- Choose `LLM_PROVIDER` (`ollama`, `openai`, `groq`, `gemini`, or `claude`)
	- Paste your own provider API key when prompted for cloud providers
	- Fill `STRAND_CORE_PROGRAM_ID` and `STRAND_SCORE_PROGRAM_ID` in `oracle/.env`
7. Configure frontend environment:
	- Fill `NEXT_PUBLIC_STRAND_*` values in `app/.env.local`
8. Run services:
	- Oracle: `cd oracle && npm run dev`
	- Frontend: `cd app && npm run dev`

## Run The Full App
Use this when you want the whole stack running locally for the MVP demo.

### Root commands
```bash
npm run setup:oracle-env
npm run dev:oracle
npm run dev:app
```

### Full local flow
```bash
# 1. Install dependencies once
npm install

# 2. Generate oracle env file and choose provider
npm run setup:oracle-env

# 3. Fill app/.env.local and oracle/.env

# 4. Start the oracle in one terminal
npm run dev:oracle

# 5. Start the frontend in a second terminal
npm run dev:app
```

### Optional build/test commands
```bash
npm run build
npm run test:anchor
npm run lint
```

## Vercel Deployment
You can deploy the Next.js frontend on Vercel, but the oracle must run as a separate always-on service.

Why: the oracle is a long-running event listener (Solana websocket subscriber), which is not suitable for Vercel serverless functions.

### Deploy frontend on Vercel
1. Import the repository in Vercel.
2. Set root directory to `app`.
3. Build command: `npm run build`
4. Output: default Next.js output.
5. Add frontend environment variables in Vercel:
	- `NEXT_PUBLIC_RPC_URL`
	- `NEXT_PUBLIC_STRAND_CORE_PROGRAM_ID`
	- `NEXT_PUBLIC_STRAND_SCORE_PROGRAM_ID`
	- `NEXT_PUBLIC_STRAND_CREDIT_PROGRAM_ID`
	- `NEXT_PUBLIC_USDC_MINT`

### Deploy oracle separately (Render/Railway/Fly/VM)
1. Deploy from `oracle/` with start command `npm run start` (after build).
2. Add oracle env vars:
	- `ANCHOR_PROVIDER_URL`
	- `ORACLE_KEYPAIR_PATH`
	- `STRAND_CORE_PROGRAM_ID`
	- `STRAND_SCORE_PROGRAM_ID`
	- `LLM_PROVIDER`
	- `OLLAMA_BASE_URL` and `OLLAMA_MODEL` if using local Ollama
	- `OPENAI_API_KEY` / `OPENAI_MODEL` / `OPENAI_BASE_URL` if using OpenAI
	- `GROQ_API_KEY` / `GROQ_MODEL` / `GROQ_BASE_URL` if using Groq
	- `GEMINI_API_KEY` / `GEMINI_MODEL` if using Gemini
	- `ANTHROPIC_API_KEY` / `CLAUDE_MODEL` if using Claude
3. Keep API keys server-side only (never expose as `NEXT_PUBLIC_*`).

## Demo
Demo video: https://example.com/strand-demo

Or run `scripts/seed-demo.ts` to seed devnet data locally.

## Business Model
Protocol fee: 0.5% on loan origination. API tier for enterprise lenders.
At 100K active workers × avg $1,000 credit = $500K annual revenue at scale.

## Judging Criteria
| Criterion | How Strand addresses it |
|-----------|------------------------|
| Functionality | All 3 programs deployed on devnet, tests passing |
| Impact | $1.5T gig economy, 1.5B workers, 0 existing Solana solutions |
| Novelty | Work-history-as-credit is new on Solana |
| UX | Sub-second score updates, Phantom wallet, shareable profiles |
| Open-source | Apache 2.0, strand-score CPI is a public primitive |
| Business Plan | Protocol fee + API tier — see above |

## License
Apache 2.0
