# Strand — Portable Work History & Credit Protocol

> Your wallet is your résumé. Your work history is your credit score.

## The Problem
Gig work is massive, but reputation is still trapped inside closed platforms. More than 1.5 billion workers cannot carry verified proof of completed work between marketplaces, so they repeatedly start from zero. Without portable work history, most freelancers also have no path to undercollateralized credit.

## What Strand Does
- Work NFTs: Every completed job mints a dual-signed on-chain work record owned by the worker wallet.
- Strand Score: A transparent 0-1000 on-chain reputation score updates from verified work and consistency.
- AI-verified skills via local Ollama: Skill claims are graded by a local LLM oracle so evidence stays on the operator machine.
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
│       └─► Ollama Oracle (off-chain Node.js service)
│               └─► POST http://localhost:11434/api/generate
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
1. Install prerequisites: Node.js 18+, Rust 1.75+, Solana CLI 1.18+, Anchor 0.31.x, Ollama.
2. Pull model:
	- `ollama pull llama3.2`
3. Configure Solana to devnet:
	- `solana config set --url devnet`
4. Install dependencies:
	- `npm install`
5. Build programs:
	- `anchor build`
6. Set environment values:
	- Fill `STRAND_CORE_PROGRAM_ID`, `STRAND_SCORE_PROGRAM_ID`, `STRAND_CREDIT_PROGRAM_ID` in `oracle/.env`.
	- Fill `NEXT_PUBLIC_STRAND_*` values in `app/.env.local`.
7. Run services:
	- Oracle: `cd oracle && npm run dev`
	- Frontend: `cd app && npm run dev`

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
