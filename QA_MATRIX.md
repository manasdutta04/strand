# Strand End-to-End QA Matrix & Smoke Tests

## QA Test Matrix

### Worker Flows

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Profile Setup** | 1. Login as worker. 2. View `/worker/dashboard`. 3. Inspect profile, score, work history. | Profile loads from chain, score >= 0, work history populated. | [ ] Pass |
| **Skill Claim** | 1. Navigate to `/worker/skills`. 2. Add skill with GitHub repo URL. 3. Wait for oracle grading. 4. Confirm skill verified on-chain. | Skill appears in list if oracle verified it (confidence >= 65). | [ ] Pass |
| **Work Completion** | 1. On `/worker/work`, view open jobs. 2. Simulate role: "complete" a job (UI flow). 3. Verify work NFT created. | Work NFT balance increases, completion recorded on-chain. | [ ] Pass |
| **Credit Access** | 1. Navigate to `/worker/credit`. 2. View available credit lines. 3. Borrow USDC if eligible. 4. Verify balance updated. | Credit line loads from chain, borrow succeeds, balance reflects in wallet. | [ ] Pass |
| **Repayment** | 1. After borrow, navigate to repay section. 2. Submit repay transaction. 3. Verify balance and loan position updated. | Loan position principal decreases, wallet shows USDC transferred. | [ ] Pass |

### Client Flows

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Job Creation** | 1. Login as client. 2. Navigate to `/client/jobs/new`. 3. Select worker address, set escrow amount ($500+), select skills. 4. Sign & fund. | Job created on-chain, escrow funded, appears in dashboard. | [ ] Pass |
| **Job Completion** | 1. As client, view active job. 2. Review work, rate worker (1–5 stars). 3. Release payment. | Job transitions to "Completed", worker receives USDC, work NFT minted. | [ ] Pass |
| **Portfolio View** | 1. Navigate to `/client/dashboard`. 2. View job statistics (open, escrowed, completion rate). | Stats reflect real on-chain job data (not hardcoded). | [ ] Pass |
| **Job Search** | 1. (Optional) Search or filter job queue. | Results are accurate, pagination works if implemented. | [ ] Pass |
| **Error Handling** | 1. Try to create job with insufficient escrow (<$10). 2. Try to select invalid worker address. | Form validation prevents submission, error message shown. | [ ] Pass |

### Lender Flows

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Underwriting Queue** | 1. Login as lender. 2. Navigate to `/lender/dashboard/queue`. 3. View open job escrows (credit requests). | Queue loads from chain, displays max 6 most recent open jobs. | [ ] Pass |
| **Approve Credit Line** | 1. In queue, click "Approve" on a job escrow. 2. Sign transaction. 3. Verify credit line opened on-chain. | Credit line created with defaults (e.g., $5k max, 12% APR), status shows "Approved". | [ ] Pass |
| **Portfolio View** | 1. Navigate to `/lender/dashboard`. 2. View active credit lines, portfolio metrics. | Shows real credit lines (lender → workers), utilization percentages. | [ ] Pass |
| **Decline Credit** | 1. In queue, click "Decline" on a job escrow. 2. Confirm action. | UI marks as declined (local state); no on-chain transaction needed. | [ ] Pass |
| **Portfolio Performance** | 1. View portfolio dashboard. 2. Inspect individual credit line details. | Metrics: max USDC, APR, min score requirement, current borrowed amount. | [ ] Pass |

### Cross-Role Flows

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **End-to-End Job Lifecycle** | 1. Client creates job. 2. Lender approves credit line for worker. 3. Worker completes job. 4. Client releases payment. 5. Worker score updates. | All on-chain transactions succeed, state transitions are correct. | [ ] Pass |
| **Mobile Responsiveness** | 1. Open each role workspace on mobile (375px width). 2. Navigate pages, submit forms. | UI is readable, buttons are clickable, no horizontal scroll. | [ ] Pass |
| **Loading States** | 1. Perform action that requires async work (e.g., create job). 2. Observe UI during loading. | "Signing transaction…" shown, button disabled until complete. | [ ] Pass |
| **Error Recovery** | 1. Simulate network failure (turn off internet briefly). 2. Retry transaction. | Error message shown, retry button available, no stuck state. | [ ] Pass |

---

## Smoke Test Script

### Setup
```bash
# Requirements: Node 18+, Solana CLI, npm, devnet RPC endpoint

# 1. Build all programs
cd programs/strand-core && anchor build && cd ../..
cd programs/strand-score && anchor build && cd ../..
cd programs/strand-credit && anchor build && cd ../..

# 2. Deploy to devnet (or use existing deployment)
anchor deploy --provider.cluster devnet

# 3. Set environment variables
export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export STRAND_CORE_PROGRAM_ID="<deployed_core_program_id>"
export STRAND_SCORE_PROGRAM_ID="<deployed_score_program_id>"
export STRAND_CREDIT_PROGRAM_ID="<deployed_credit_program_id>"
export DEVNET_USDC_MINT="EPjFWaLb3c9LsrSvWysfjzmbNENjVZ2CNrqCjsQ3fAd"

# 4. Seed demo data
npm run seed:demo

# 5. Start oracle
cd oracle && npm run start &
cd ..

# 6. Start frontend dev server
cd app && npm run dev &
cd ..
```

### Test Commands

```bash
# Run TypeScript type checker
npm run typecheck

# Run linter
npm run lint

# Run full test suite (if implemented)
npm test

# Build frontend
cd app && npm run build

# Health check oracle
curl http://localhost:3000/health
```

### Manual Test Sequence (With Browser)

1. **Worker Flow:**
   - Open browser, navigate to `localhost:3000`
   - Login as Worker (click demo link)
   - Check `/worker/dashboard` loads with real data
   - Go to `/worker/skills` and claim a skill with a GitHub URL
   - Wait 30s for oracle to grade (check console for logs)
   - Verify skill appears in UI once graded

2. **Client Flow:**
   - Open new incognito window
   - Login as Client
   - Navigate to `/client/jobs/new`
   - Create job targeting worker from step 1
   - Fill: worker address, $500 escrow, select skill
   - Sign transaction with wallet
   - Verify job appears in `/client/dashboard`

3. **Lender Flow:**
   - Open another incognito window
   - Login as Lender
   - Navigate to `/lender/dashboard/queue`
   - Click "Approve" on the job from Client flow
   - Sign transaction
   - Verify credit line appears in `/lender/dashboard`

4. **Complete Cycle:**
   - As Client, complete the job and release payment
   - As Worker, verify payment received
   - Verify score increased post-completion

---

## Automated Smoke Test (Node.js)

```typescript
// tests/smoke-test.ts (example structure)
import { describe, it, expect } from "@jest/globals";
import { PublicKey, Connection } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

describe("Smoke Tests", () => {
  let connection: Connection;
  let provider: anchor.AnchorProvider;

  beforeAll(async () => {
    connection = new Connection("https://api.devnet.solana.com", "confirmed");
    // Set up provider...
  });

  it("should return health check", async () => {
    const response = await fetch("http://localhost:3000/health");
    expect(response.status).toBe(200);
    const health = await response.json();
    expect(health.status).toMatch(/healthy|degraded/);
  });

  it("should load worker profile from chain", async () => {
    // Call data-access function for worker
    // Verify it returns non-null profile
  });

  it("should create job and fund escrow", async () => {
    // Build createJob transaction
    // Send and confirm
    // Verify escrow account created
  });

  it("should approve credit line", async () => {
    // Call openCreditLine transaction
    // Verify credit line PDA created
    // Verify lender vault funded
  });
});
```

---

## Sign-Off Checklist (Before Production)

- [ ] Worker QA matrix: all tests pass
- [ ] Client QA matrix: all tests pass
- [ ] Lender QA matrix: all tests pass
- [ ] Cross-role flows: all tests pass
- [ ] Mobile responsiveness verified
- [ ] Loading/error states tested
- [ ] Smoke tests pass end-to-end
- [ ] No console errors or warnings in production build
- [ ] TypeScript build succeeds with no errors
- [ ] Linting passes
- [ ] Security checklist passed (both Manas and Priya)
- [ ] Deployment runbook tested in staging

**Signed off by:**
- [ ] Manas (Backend/Oracle): _________________ Date: _______
- [ ] Priya (Frontend/QA): ____________________ Date: _______
