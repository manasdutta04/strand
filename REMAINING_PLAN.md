# Strand Remaining Work Plan (Updated)

This plan includes **only remaining tasks** to make Strand production-ready (no mocks).

Goal: both people work every day, in parallel, with clean ownership and no merge conflicts.

---

## Status snapshot (as of 2026-05-05)

### Completed
- Day 1 (Manas + Priya): worker data layer cutover is done.
- Day 1 deliverable: worker workspace no longer uses localStorage as source-of-truth for score/work/credit/skills.
- Day 2 (Manas): transaction helper layer is implemented in `app/src/lib/**` with typed `build*` + `execute*` APIs for:
  - create job + fund escrow
  - complete job
  - claim skill
  - borrow/repay
- Day 2 (Manas): PDA derivation helpers, USDC conversion/validation utilities, and non-UI test vectors are added.

### Not yet completed
- Day 2 (Priya): client and lender UI routes are not wired to the new tx/data helpers yet.
- Client and lender dashboards still show hardcoded demo values/lists.
- Lender queue approve/decline actions are still UI-only.
- Day 3 and Day 4 hardening/QA/release tasks are still pending.

---

## 0) Current gaps (remaining only)

1. Client and lender dashboards still use hardcoded demo numbers/lists.
2. Client job page UI is not yet wired to the new tx helper APIs.
3. Lender queue approve/decline actions are not connected to real operations.
4. End-to-end QA + deploy hardening for full 3-role live flow is still pending.

---

## 1) Ownership model (strict no-clash)

### Manas owns (backend/protocol/data/reliability)
- `programs/**`
- `oracle/**`
- `scripts/**`
- backend/data access modules under `app/src/lib/**` (new ones)
- infra/deploy/monitoring docs

### Priya owns (frontend role workspaces + UX + QA)
- `app/src/app/**` (pages/routes/layout UX)
- `app/src/components/**` (UI components)
- frontend user docs and test scripts

### Shared files (edit only with explicit handoff)
- `README.md`
- `.env.example` files
- `app/src/lib/programs.ts` (if both need changes, Manas edits API, Priya consumes only)

---

## 2) Final architecture decision (for this 4-day sprint)

- Chain remains source of truth.
- Oracle remains long-running verifier service.
- Frontend stops using local mock storage for product-critical data.
- If direct RPC queries are slow, add a lightweight read service/index endpoint (Manas-owned).

---

## 3) Day-by-day execution

## Day 1 - Data layer cutover + UI integration start (Completed)

### Manas (backend/protocol)
1. Built production data-access functions for:
   - worker profile
   - score state
   - work NFT list
   - credit line + loan position
2. Exposed stable typed methods in `app/src/lib` for frontend consumption.
3. Ensured oracle event handlers are wrapped with resilience logging/error handling.

**Deliverable**
- Achieved.

### Priya (frontend)
1. Replaced worker pages to consume real data methods:
   - `/worker/dashboard`
   - `/worker/work`
   - `/worker/skills`
   - `/worker/credit`
2. Removed old worker local mock presentation logic.
3. Kept route guards + empty states.

**Deliverable**
- Achieved.

---

## Day 2 - Transaction wiring for client + lender (In Progress)

### Manas
1. Wired transaction builders and execute helpers for:
   - create job + fund escrow
   - complete job
   - claim skill
   - borrow/repay
2. Added validation/test-vector support for PDA derivations, amounts, and request guards.
3. Published reusable typed helper APIs under `app/src/lib/**`.

**Deliverable**
- Achieved on backend/helper side.

### Priya
1. Connect `/client/jobs/new` form to real tx flow (Pending).
2. Replace client dashboard hardcoded cards/list with live query data (Pending).
3. Replace lender dashboard hardcoded cards/list with live data feed shape (Pending).
4. Keep loading/error states clear for each role (Pending).

**Deliverable**
- Pending Priya integration.

---

## Day 3 - End-to-end flow hardening

### Manas
1. Run and fix protocol + oracle edge cases:
   - retries
   - failed tx handling
   - stale account reads
2. Add health checks and structured logs for oracle.
3. Finalize staging deploy config for frontend + oracle.

**Deliverable**
- Stable backend behavior under realistic failures.

### Priya
1. Full UX pass for all roles:
   - success/fail feedback
   - action disabling during pending tx
   - accurate status labels
2. Implement lender queue real action handling (approve/decline flow backed by real operations).
3. Accessibility and responsive final pass.

**Deliverable**
- Production-usable role flows with clear user feedback.

---

## Day 4 - QA, release lock, production handoff

### Manas
1. Final security sanity pass (wallet auth paths + funds flow).
2. Final deploy + rollback runbook.
3. Production smoke tests for oracle + chain connectivity.

### Priya
1. Execute final role QA matrix:
   - Worker: profile/score/work/skills/credit
   - Client: job create/fund/complete
   - Lender: queue/portfolio actions
2. Final docs update for users and teammate handoff.

### Joint sign-off (must pass)
1. No mock/hardcoded core business data in runtime paths.
2. No localStorage as source of truth for score/work/credit.
3. All 3 role flows are transaction-complete and test-verified.
4. Build + staging run clean.

---

## 4) Exact remaining task split table

| Remaining Task | Owner | Files/Modules |
|---|---|---|
| Wire client job page to real tx helpers | Priya (consume) + Manas (support) | Priya: `app/src/app/client/jobs/new/page.tsx`; Manas: helper usage support in `app/src/lib/**` |
| Replace client dashboard hardcoded stats/jobs | Priya | `app/src/app/client/dashboard/page.tsx` |
| Replace lender dashboard hardcoded portfolio/queue | Priya (UI) + Manas (data source support) | `app/src/app/lender/dashboard/**` + `app/src/lib/**` |
| Lender approve/decline action wiring | Priya (integration) + Manas (tx/data support) | Priya: lender pages/actions; Manas: helper additions if needed |
| Oracle reliability + observability hardening | Manas | `oracle/src/**` |
| End-to-end QA across all roles | Priya (lead), Manas (fix support) | QA docs + route-by-route tests |
| Production deploy/runbook finalization | Manas | Infra/runbook docs |

---

## 5) Anti-clash rules for AI agents

1. Manas-agent never edits `app/src/app/**` unless Priya asks.
2. Priya-agent never edits `programs/**`, `oracle/**`, or backend data contracts.
3. Shared file edits require explicit lock in commit message:
   - `LOCK: README.md` etc.
4. Merge cadence:
   - end of Day 1, Day 2, Day 3 mandatory integration merge.
5. No feature additions beyond listed remaining tasks.

---

## 6) Definition of done (production-ready)

- No core mocks left.
- No hardcoded fake business metrics in dashboards.
- Role routes are guarded and complete.
- Worker/Client/Lender journeys execute real transactions.
- Oracle pipeline stable and observable.
- Both Manas and Priya sign final QA sheet.
