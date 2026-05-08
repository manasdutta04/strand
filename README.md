# Strand - Portable Gig Reputation & Credit Protocol

> Your wallet is your résumé. Your earnings history is your credit history.

## The Problem
India’s gig economy is huge, but reputation stays trapped inside each platform. A delivery rider on Zomato or Swiggy cannot carry verified earnings history to the next marketplace, and most workers still have no practical path to small, undercollateralized credit for bikes, phones, or emergencies.

## What Strand Does
- WorkRecords: Each verified earnings PDF creates an on-chain record owned by the worker wallet.
- Strand Score: A transparent 0-1000 reputation score updates from earnings volume, consistency, tenure, ratings, cross-platform activity, and repayment.
- Multi-provider oracle: PDFs can be parsed locally with Ollama or through OpenAI, Anthropic, Gemini, or Groq.
- Credit layer: A single protocol vault issues USDC credit lines once a worker reaches the minimum score.
- INR/USD display: The app shows both USDC and INR so Indian workers can understand their borrowing power instantly.

## Why This Wins
1. It fits the real workflow: upload an earnings screenshot or PDF, get reputation, then unlock credit.
2. It is portable: the score follows the worker across Zomato, Swiggy, Blinkit, Ola, Uber, and similar platforms.
3. It is composable: `strand-score` is a standalone primitive that other Solana apps can CPI into.

## Architecture
```text
Worker wallet
│
├─► Upload earnings PDF
│       │
│       └─► Oracle service (Ollama / OpenAI / Claude / Gemini / Groq)
│               └─► Extract earning amount, delivery count, platform
│
├─► strand-core ──CPI──► strand-score
│       │
│       ├─► WorkRecord PDA
│       └─► PlatformLink PDA
│
├─► strand-score ──read──► strand-credit
│       │
│       └─► ScoreState PDA
│
└─► strand-credit
	├─► ProtocolVault PDA
	├─► CreditLine PDA
	└─► LoanPosition PDA
```

## SaaS App Routing (Frontend)

The frontend is role-oriented, but the worker path is the main demo surface:

- Landing and role entry:
	- `/` role selection hub
	- `/login/worker`
	- `/login/client`
	- `/login/lender`

- Worker workspace:
	- `/worker/dashboard` earnings upload, score, and credit overview
	- `/worker/work` record history
	- `/worker/skills` attestations
	- `/worker/credit` borrowing and repayment

- Public profile:
	- `/profile/[wallet]` shareable worker reputation page

- Client and lender routes still exist for compatibility, but the hackathon demo is worker-first.

## Quick Start
1. Install prerequisites: Node.js 18+, Rust 1.75+, Solana CLI 1.18+, Anchor 0.31.x.
2. Pick an oracle provider:
	- Local Ollama: install Ollama and run `ollama pull llama3.2-vision`
	- Cloud mode: set `LLM_PROVIDER` to `openai`, `anthropic`, `gemini`, or `groq`, then add the matching API key in `oracle/.env`
3. Configure Solana to devnet:
	- `solana config set --url devnet`
4. Install dependencies:
	- `npm install`
5. Build programs:
	- `anchor build`
6. Configure oracle and frontend env files:
	- Run `npm run setup:oracle-env`
	- Fill `STRAND_CORE_PROGRAM_ID`, `STRAND_SCORE_PROGRAM_ID`, and `STRAND_CREDIT_PROGRAM_ID` in `oracle/.env`
	- Fill `NEXT_PUBLIC_STRAND_*` values and `NEXT_PUBLIC_INR_TO_USD_RATE` in `app/.env`
7. Run services:
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

# 3. Fill app/.env and oracle/.env

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

Or run `scripts/seed-demo.ts` to print the Ravi demo flow locally.

## Business Model
Protocol fee: 0.5% on loan origination. Enterprise API tier for lenders and fintech partners.
At 100K active workers × average $1,000 credit, Strand can support meaningful transaction volume while keeping the worker UX simple.

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


## Creators

<table>
  <tbody>
    <tr>
    <td align="center" valign="top" width="14.28%"><a href="https://github.com/manasdutta04"><img src="https://avatars.githubusercontent.com/u/122201926?v=4?s=100" width="100px;" alt="Manas Dutta"/><br /><sub><b>Manas Dutta</b></sub></a><br /></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/priya369-ps"><img src="https://avatars.githubusercontent.com/u/253213951?v=4?s=100" width="100px;" alt="Priya Kanta"/><br /><sub><b>Priya Kanta</b></sub></a><br /></td>
    </tr>
  </tbody>
</table>