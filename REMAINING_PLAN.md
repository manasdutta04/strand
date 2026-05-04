# Strand Remaining Work Plan (4 Days, No Clash)

This plan includes **only remaining tasks** to make Strand production-ready (no mocks).

Goal: both people work every day, in parallel, with clean ownership and no merge conflicts.

---

## 0) Current gaps (remaining only)

1. Frontend still uses `localStorage` for core product state (score/work/credit/skills).
2. Client and lender dashboards still use hardcoded demo numbers/lists.
3. Client job flow is UI-only (not fully wired to real on-chain tx path).
4. Lender queue actions are UI-only (approve/decline not connected).
5. No unified production data-access layer (chain/indexed reads).
6. QA + deploy hardening for full 3-role live flow still pending.

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

## Day 1 - Data layer cutover + UI integration start

### Manas (backend/protocol)
1. Build production data-access functions for:
   - worker profile
   - score state
   - work NFT list
   - credit line + loan position
2. Expose stable typed methods in `app/src/lib` for frontend consumption.
3. Ensure oracle emits/handles events cleanly for score + skill updates.

**Deliverable**
- Frontend can call real read APIs (no localStorage dependency for critical data).

### Priya (frontend)
1. Replace worker pages to consume real data methods:
   - `/worker/dashboard`
   - `/worker/work`
   - `/worker/skills`
   - `/worker/credit`
2. Remove old local mock presentation logic.
3. Keep route guards intact and user-friendly empty states for true-zero data.

**Deliverable**
- Worker workspace shows live chain-backed data only.

---

## Day 2 - Transaction wiring for client + lender

### Manas
1. Wire transaction builders for:
   - create job + fund escrow
   - complete job
   - claim skill
   - borrow/repay
2. Validate signer/account constraints with test vectors.
3. Provide reusable transaction helper APIs to frontend.

**Deliverable**
- All core tx paths available from frontend via typed helpers.

### Priya
1. Connect `/client/jobs/new` form to real tx flow.
2. Replace client dashboard hardcoded cards/list with live query data.
3. Replace lender dashboard hardcoded cards/list with live data feed shape.
4. Keep loading/error states clear for each role.

**Deliverable**
- Client and lender workspaces stop using hardcoded mock data.

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
| Remove `localStorage` score/work/credit source-of-truth | Manas + Priya (handoff) | Manas: `app/src/lib/**` data APIs; Priya: `app/src/app/worker/**`, `app/src/components/**` |
| Wire real client job transactions | Manas + Priya | Manas: tx helpers in `app/src/lib/programs.ts` + related libs; Priya: `app/src/app/client/jobs/new/page.tsx` |
| Replace client dashboard hardcoded stats/jobs | Priya | `app/src/app/client/dashboard/page.tsx` |
| Replace lender dashboard hardcoded portfolio/queue | Priya (UI) + Manas (data source) | `app/src/app/lender/dashboard/**` + Manas data endpoints/helpers |
| Lender approve/decline action wiring | Manas + Priya | Manas tx/data functions; Priya button/action integration in lender pages |
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
