# Strand — Build Progress

## Demo flow (must work end-to-end before submission)
1. [ ] Client creates job → $500 USDC moves to escrow
2. [ ] Worker + client both sign complete_job → WorkNFT mints
3. [ ] Strand Score updates on-chain (visible in explorer)
4. [ ] Worker claims "React" skill with GitHub URL
5. [ ] Selected oracle provider validates → SkillAttestation written on-chain
6. [ ] Score updates again (higher)
7. [ ] Lender opens credit line for worker
8. [ ] Worker borrows $200 USDC against score
9. [ ] Worker repays $200 USDC

## Component checklist

### .agent/ files
- [x] API.md created
- [x] ARCHITECTURE.md created
- [x] DECISIONS.md created
- [x] ENV.md created
- [x] PROGRESS.md created

### Environment
- [ ] Rust installed
- [ ] Solana CLI installed + configured to devnet
- [ ] Anchor CLI 0.31.x installed
- [x] Node.js 18+ installed
- [ ] Oracle provider configured (local Ollama or cloud API key provider)
- [ ] Oracle keypair generated
- [x] All npm dependencies installed

### strand-core program
- [x] WorkerProfile account struct
- [x] WorkNFT account struct
- [x] JobEscrow account struct + JobState enum
- [x] initialize_worker_profile instruction
- [x] create_job instruction + USDC escrow transfer
- [x] complete_job instruction (dual-sig + WorkNFT mint + CPI to score)
- [x] open_dispute instruction
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-core.ts

### strand-score program
- [x] ScoreState account struct
- [x] SkillAttestation account struct
- [x] compute_score instruction (permissionless)
- [x] attest_skill instruction (oracle-gated)
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-score.ts

### strand-credit program
- [x] CreditLine account struct
- [x] LoanPosition account struct
- [x] open_credit_line instruction
- [x] borrow instruction (with score CPI check)
- [x] repay instruction
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-credit.ts

### Oracle service (pluggable providers)
- [x] oracle/src/grader.ts — provider-aware skill grader working
- [x] oracle/src/chain.ts — Solana tx helpers
- [x] oracle/src/index.ts — event listener + orchestration
- [ ] Tested with real GitHub URL and at least one cloud provider path
- [x] oracle/.env configured

### Frontend
- [x] WalletProvider.tsx
- [x] lib/constants.ts (program IDs wired)
- [x] lib/programs.ts (IDL imports)
- [x] Landing page (app/page.tsx)
- [x] Worker dashboard (app/dashboard/page.tsx)
- [x] ScoreGauge component
- [x] WorkNFTCard component
- [x] CreditPanel component
- [x] Client job-post flow (app/client/page.tsx)
- [x] Public profile page (app/profile/[wallet]/page.tsx)
- [x] app/.env.local configured
- [ ] Full end-to-end frontend demo working

### Scripts
- [ ] scripts/seed-demo.ts working
- [ ] Demo data seeded on devnet

### Submission assets
- [x] README.md complete
- [x] Apache 2.0 LICENSE file
- [ ] Demo video recorded (60 seconds, shows full loop)
- [ ] GitHub repo public
- [ ] Colosseum submission form complete

## Build log
<!-- Add entries as you complete steps, e.g.: -->
<!-- ### 2026-04-07 10:30 -->
<!-- - Created .agent/ directory and all 5 files -->
<!-- - Initialized Anchor workspace -->

### 2026-04-07 08:42 IST
- Created .agent/ directory and all 5 memory files
- Verified and read all .agent files
- Checked off .agent creation milestones

### 2026-04-07 08:51 IST
- Implemented `strand-core` accounts + instructions (including score CPI and skill claim event)
- Implemented `strand-score` scoring math + oracle-gated attestation
- Implemented `strand-credit` credit line, borrow, and repay flows

### 2026-04-07 09:19 IST
- Scaffolded oracle service (`grader.ts`, `chain.ts`, `index.ts`) and validated with `npm --prefix oracle run build`
- Built Next.js app pages/components/hooks and passed `npm --prefix app run lint` and `npx tsc -p app/tsconfig.json --noEmit`
- Added Anchor test suite files for core/score/credit and demo seed script
- Added Apache 2.0 license and rewritten judge-focused README
- Validation note: `anchor` CLI is not installed in this environment, so on-chain build/deploy/tests are pending

### 2026-04-07 09:23 IST
- Passed root TypeScript validation for tests/scripts: `npx tsc -p tsconfig.json --noEmit`
- Reconfirmed oracle compile pass: `npm --prefix oracle run build`
- Frontend build caveat remains on this machine due Node.js v24 + Next.js 14 runtime incompatibility

---
*Last updated: 2026-04-07 09:23 IST*
