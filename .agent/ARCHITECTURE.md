# Strand — Technical Architecture

## System overview (GIG WORKER EDITION)
Worker (Phantom wallet)
│
├─► Earnings PDF (Zomato/Swiggy/Blinkit/Ola/Uber)
│       │
│       ▼
│   Oracle Service (Node.js)
│   ├─ Ollama vision (localhost:11434) OR
│   ├─ OpenAI gpt-4o (OPENAI_API_KEY) OR
│   ├─ Anthropic Claude (ANTHROPIC_API_KEY) OR
│   ├─ Google Gemini (GEMINI_API_KEY) OR
│   └─ Groq (GROQ_API_KEY)
│       │
│       ├─ Extracts: earning_amount, date, delivery_count, platform
│       │
│       ▼
│   strand-core program
│   ├─ submit_work_record (oracle-signed CPI)
│   │   └─► WorkRecord PDA minted
│   │   └─► PlatformLink verified (e.g., "zomato:worker123")
│   │
│   └─ CPI to strand-score
│       └─► compute_score (permissionless)
│           └─► ScoreState updated with 6 components
│
├─► Worker opens credit line
│   └─► strand-credit reads score via CPI
│   └─► Calculates credit_limit = (score - 400) × $10 USDC
│   └─► Borrow from ProtocolVault
│
└─► ProtocolVault (single USDC SPL account, PDA-owned)



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
| Account | Seeds | Purpose |
|---------|-------|---------|
| WorkerProfile | `["profile", worker_pubkey]` | Registration + stake tracking |
| WorkRecord | `["work", worker_pubkey, record_id_le_u64]` | Individual earnings proof |
| PlatformLink | `["platform", worker_pubkey, platform_name_bytes]` | Multi-platform identity (Zomato/Swiggy/etc) |
| ScoreState | `["score", worker_pubkey]` | 6-component score cache |
| SkillAttestation | `["skill", worker_pubkey, skill_tag_bytes]` | Verified skills (GitHub URL, etc) |
| ProtocolVault | `["vault"]` | Single USDC account for all credit lending |
| CreditLine | `["credit", worker_pubkey]` | Worker's credit position vs protocol |
| LoanPosition | `["loan", worker_pubkey]` | Repayment tracking |

## Scoring formula (integer math only — no floats on-chain, D-011)

| Component | Calculation | Max Points |
|-----------|------------|-----------|
| Delivery Volume | min(total_deliveries, 1000) × 200 / 1000 | 200 |
| Earnings Consistency | min(on_time_ratio × 100, 100) × 150 / 100 | 150 |
| Tenure | min(account_age_days, 180) × 150 / 180 | 150 |
| Rating Points | min(average_rating × 50, 200) | 200 |
| Cross-Platform | min(linked_platforms_count × 30, 150) | 150 |
| Repayment | min(loans_repaid_on_time × 15, 150) | 150 |
| **TOTAL SCORE** | **Sum of above** | **1000** |

**Credit Calculation:**
- Minimum score for credit: **400 points**
- Credit limit = `(score - 400) × $10 USDC` (max ≈ $6,000 at score 1000)
- Interest rate (APR) = `24% - (score / 1000) × 12%` (score 400 → 19.2% APR; score 1000 → 12% APR)
- Monthly interest accrual in basis points: `APR × principal / 12 months`

## Oracle architecture (pluggable providers, vision-model enabled, D-008)
Worker uploads: earnings PDF (e.g., zomato_earnings_may_2026.pdf)
│
oracle/src/agent.ts (Node.js, file watcher on ./uploads/)
│
├─► oracle/src/pdf-parser.ts extracts PDF → base64
│
└─► Provider selected by `LLM_PROVIDER` env var
	├─► **Ollama (LOCAL, default):**
	│   POST http://localhost:11434/api/generate
	│   Model: llama3.2-vision (must pull first: `ollama pull llama3.2-vision`)
	│   Prompt: "Extract earning amount (₹), date, platform, delivery count from this earnings screenshot"
	│   Requires: 4GB+ VRAM
	│
	├─► **OpenAI (CLOUD):**
	│   POST https://api.openai.com/v1/chat/completions
	│   Model: gpt-4o or gpt-4-turbo
	│   Header: Authorization: Bearer {OPENAI_API_KEY}
	│   Vision: base64 image_url in content
	│
	├─► **Anthropic Claude (CLOUD):**
	│   POST https://api.anthropic.com/v1/messages
	│   Model: claude-3-5-sonnet-latest
	│   Header: x-api-key: {ANTHROPIC_API_KEY}
	│   Vision: image/* media type in content block
	│
	├─► **Google Gemini (CLOUD):**
	│   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
	│   Param: key={GEMINI_API_KEY}
	│   Vision: base64 encoded inlineData
	│
	└─► **Groq (CLOUD, if vision enabled):**
	    POST https://api.groq.com/openai/v1/chat/completions
	    Model: (text-only for now; vision TBD)
	    Header: Authorization: Bearer {GROQ_API_KEY}
│
└─► Returns JSON: { earning_amount, date, platform, delivery_count, verified: true }
│
└─► oracle/src/chain.ts calls submit_work_record CPI (oracle keypair signs)
│
└─► strand-core WorkRecord + PlatformLink minted on-chain
│
└─► strand-score compute_score triggered automatically

## Account sizes (bytes, for rent-exempt calculation)
| Account | Size | Notes |
|---------|------|-------|
| WorkerProfile | ~350 | Includes stake lamports |
| WorkRecord | ~200 | Earning amount, date, platform, delivery count |
| PlatformLink | ~150 | Platform name string (Zomato/Swiggy) + verified flag |
| ScoreState | ~60 | 6 u16 components (12 bytes) + metadata |
| SkillAttestation | ~150 | Skill tag + GitHub URL |
| ProtocolVault | ~100 | Total USDC deposited, total loaned |
| CreditLine | ~100 | Worker pubkey, available credit, used credit |
| LoanPosition | ~90 | Principal, accrued interest, repayment schedule |

---
*Last updated: 2026-05-07 11:20 IST (Gig Worker Edition)*
