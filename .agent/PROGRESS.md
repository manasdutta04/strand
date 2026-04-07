# Strand — Build Progress

## Demo flow (must work end-to-end before submission)
1. [ ] Client creates job → $500 USDC moves to escrow
2. [ ] Worker + client both sign complete_job → WorkNFT mints
3. [ ] Strand Score updates on-chain (visible in explorer)
4. [ ] Worker claims "React" skill with GitHub URL
5. [ ] Ollama oracle validates → SkillAttestation written on-chain
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
- [ ] Node.js 18+ installed
- [ ] Ollama installed + llama3.2 pulled
- [ ] Oracle keypair generated
- [ ] All npm dependencies installed

### strand-core program
- [ ] WorkerProfile account struct
- [ ] WorkNFT account struct
- [ ] JobEscrow account struct + JobState enum
- [ ] initialize_worker_profile instruction
- [ ] create_job instruction + USDC escrow transfer
- [ ] complete_job instruction (dual-sig + WorkNFT mint + CPI to score)
- [ ] open_dispute instruction
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-core.ts

### strand-score program
- [ ] ScoreState account struct
- [ ] SkillAttestation account struct
- [ ] compute_score instruction (permissionless)
- [ ] attest_skill instruction (oracle-gated)
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-score.ts

### strand-credit program
- [ ] CreditLine account struct
- [ ] LoanPosition account struct
- [ ] open_credit_line instruction
- [ ] borrow instruction (with score CPI check)
- [ ] repay instruction
- [ ] Deployed to devnet → program ID recorded in ENV.md
- [ ] Tests passing: all strand-credit.ts

### Oracle service (Ollama)
- [ ] oracle/src/grader.ts — Ollama skill grader working
- [ ] oracle/src/chain.ts — Solana tx helpers
- [ ] oracle/src/index.ts — event listener + orchestration
- [ ] Tested with real GitHub URL (skill validated end-to-end)
- [ ] oracle/.env configured

### Frontend
- [ ] WalletProvider.tsx
- [ ] lib/constants.ts (program IDs wired)
- [ ] lib/programs.ts (IDL imports)
- [ ] Landing page (app/page.tsx)
- [ ] Worker dashboard (app/dashboard/page.tsx)
- [ ] ScoreGauge component
- [ ] WorkNFTCard component
- [ ] CreditPanel component
- [ ] Client job-post flow (app/client/page.tsx)
- [ ] Public profile page (app/profile/[wallet]/page.tsx)
- [ ] app/.env.local configured
- [ ] Full end-to-end frontend demo working

### Scripts
- [ ] scripts/seed-demo.ts working
- [ ] Demo data seeded on devnet

### Submission assets
- [ ] README.md complete
- [ ] Apache 2.0 LICENSE file
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

---
*Last updated: 2026-04-07 08:42 IST*
