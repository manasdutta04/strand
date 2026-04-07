# Strand — Technical Architecture

## System overview
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



## Programs

### strand-core
- **Purpose:** Job lifecycle, escrow, WorkNFT minting, WorkerProfile tracking
- **Program ID:** <!-- fill in after: anchor deploy -->
- **Location:** `programs/strand-core/src/lib.rs`
- **Instruction note:** Emits `WorkCompleted` and `SkillClaim` events for oracle subscription

### strand-score  
- **Purpose:** Reputation scoring, skill attestations, score history
- **Program ID:** <!-- fill in after: anchor deploy -->
- **Location:** `programs/strand-score/src/lib.rs`

### strand-credit
- **Purpose:** Credit lines, borrow, repay, liquidation
- **Program ID:** <!-- fill in after: anchor deploy -->
- **Location:** `programs/strand-credit/src/lib.rs`

## PDA seeds (canonical — never change without updating DECISIONS.md)
| Account | Seeds |
|---------|-------|
| WorkerProfile | `["profile", worker_pubkey]` |
| WorkNFT | `["work_nft", worker_pubkey, job_id_le_bytes]` |
| JobEscrow | `["escrow", client_pubkey, job_id_le_bytes]` |
| EscrowTokenAccount | `["escrow_token", client_pubkey, job_id_le_bytes]` |
| SkillClaim | `["skill_claim", worker_pubkey, skill_tag_bytes]` |
| ScoreState | `["score", worker_pubkey]` |
| SkillAttestation | `["skill", worker_pubkey, skill_tag_bytes]` |
| CreditLine | `["credit_line", lender_pubkey, worker_pubkey]` |
| LenderVault | `["lender_vault", lender_pubkey, worker_pubkey]` |
| LoanPosition | `["loan", lender_pubkey, worker_pubkey]` |

## Scoring formula (integer math only — no floats on-chain)

volume      = min(total_earned_usdc, 50_000) * 250 / 50_000     → max 250
consistency = min(jobs_completed, 100) * 250 / 100              → max 250
diversity   = min(unique_clients, 20) * 150 / 20                → max 150
longevity   = min(account_age_months, 24) * 100 / 24            → max 100
skills      = min(attested_skill_count * 15, 150)               → max 150
reliability = on_time_completions * 100 / jobs_completed        → max 100
TOTAL SCORE = sum                                                → max 1000

- Credit limit = `score * 10` USDC (score 500 → $5,000 max)
- APR = `24% − (score / 1000 * 12%)` (score 1000 → 12% APR)

## Oracle architecture (Ollama — local)
strand-core emits WorkCompleted / SkillClaim events
│
oracle/src/index.ts (Node.js, websocket subscriber)
│
├─► On WorkCompleted → CPI compute_score
└─► On SkillClaim → oracle/src/grader.ts
│
└─► POST localhost:11434/api/generate (llama3.2)
│
└─► Returns JSON: { verified_skills, confidences, quality_rating }
│
└─► attest_skill instruction (oracle keypair signs)
│
└─► compute_score (permissionless, anyone calls)

## Account sizes (bytes, for rent-exempt calculation)
| Account | Size |
|---------|------|
| WorkerProfile | ~300 |
| WorkNFT | ~400 |
| JobEscrow | ~130 |
| ScoreState | ~60 |
| SkillAttestation | ~150 |
| CreditLine | ~90 |
| LoanPosition | ~90 |

---
*Last updated: 2026-04-07 08:51 IST*
