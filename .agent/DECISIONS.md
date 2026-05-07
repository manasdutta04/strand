# Strand — Design Decisions Log

Each entry format:
**Decision:** What was decided
**Alternatives:** What else was considered  
**Reason:** Why this was chosen
**Date:** When decided

---

## D-001: Pluggable oracle providers with Ollama default
**Decision:** Use a provider abstraction for skill validation with Ollama as the local default and OpenAI, Groq, Gemini, or Claude as supported cloud options via user-supplied API keys.
**Alternatives:** Ollama-only oracle, cloud-only oracle, hard-coded provider-specific implementations
**Reason:** This keeps the MVP usable for privacy-first local demos while also making the SaaS product viable for users who only want to bring API keys. The oracle code stays server-side, and the frontend never needs provider credentials.
**Date:** 2026-05-05

## D-002: Three separate Anchor programs instead of one monolith
**Decision:** strand-core / strand-score / strand-credit as independent programs
**Alternatives:** Single program with all instructions
**Reason:** External composability — any DeFi protocol can CPI into strand-score to 
read a reputation score without taking on strand-core's job escrow logic. This is a
key differentiator for the "open-source" judging criterion.
**Date:** 2026-04-07

## D-003: Score is permissionlessly recomputable
**Decision:** Anyone can call compute_score for any worker
**Alternatives:** Only the worker can trigger recompute; oracle triggers recompute
**Reason:** Lenders need to be able to verify a score is current without trusting the
worker to have called the update. Permissionless = trustless.
**Date:** 2026-04-07

## D-004: WorkNFTs as PDAs, not actual Metaplex NFTs (for MVP)
**Decision:** Store work records as plain Anchor PDAs, not Metaplex NFTs
**Alternatives:** Mint actual NFTs via Metaplex Token Metadata
**Reason:** Simpler, faster to build, lower transaction cost. Can migrate to full
Metaplex NFTs post-hackathon for marketplace composability. For the demo, what matters
is the data is on-chain and verifiable.
**Date:** 2026-04-07

## D-005: Add explicit skill-claim event instruction in strand-core
**Decision:** Add `claim_skill(skill_tag, work_sample_url)` instruction that emits a `SkillClaim` event.
**Alternatives:** Have frontend call oracle directly; infer claims only from completed jobs.
**Reason:** Keeps the oracle flow trust-minimized and on-chain initiated. The oracle can subscribe to a canonical event stream and attest skills deterministically.
**Date:** 2026-04-07

## D-006: Frontend demo state uses local persistence until devnet IDs are deployed
**Decision:** Use localStorage-backed hooks for score/work/credit views in the Next.js UI scaffold.
**Alternatives:** Hard-block UI until all program IDs are deployed and seeded on devnet.
**Reason:** Keeps UX and flow testable immediately during scaffold stage while preserving clear integration points (`lib/programs.ts`, env IDs) for on-chain wiring.
**Date:** 2026-04-07

## D-007: Gig worker earnings PDF flow replaces job-based flow
**Decision:** Core mechanic is: worker uploads Zomato/Swiggy/Blinkit/Ola/Uber earnings PDF → oracle vision model reads → WorkRecord PDA minted → score updated. No client job posting.
**Alternatives:** Keep job-based model; add PDF as optional secondary flow; hybrid model
**Reason:** Colosseum Frontier hackathon targets India's 12M gig workers. Earnings proof is the atomic unit, not job postings. This aligns with real Zomato/Swiggy workflows and creates portable work history that workers own.
**Date:** 2026-05-07

## D-008: Ollama vision model (llama3.2-vision) for PDF parsing, with cloud provider fallback
**Decision:** Use `ollama run llama3.2-vision` locally by default. Support OpenAI (gpt-4o, gpt-4-turbo), Anthropic Claude (claude-3-5-sonnet), Google Gemini (vision-capable model), and Groq (if available). All providers read earnings PDFs deterministically.
**Alternatives:** Cloud-only; Tesseract OCR + LLM; hard-coded PDF parsing library
**Reason:** Vision models extract earning amount, date, platform, and delivery count from unstructured PDFs reliably. Ollama keeps MVP offline-capable. Cloud fallbacks scale for production.
**Date:** 2026-05-07

## D-009: PlatformLink account tracks worker across multiple platforms
**Decision:** Add `PlatformLink` PDA with seeds `[\"platform\", worker_pubkey, platform_name]` storing verified identity on Zomato/Swiggy/Blinkit/Ola/Uber/UberEats etc.
**Alternatives:** Consolidate all platforms into single WorkerProfile; separate program per platform
**Reason:** Indian gig workers typically work 2-3 platforms simultaneously. Linking creates portable reputation across platforms, which is the core value prop vs. Zomato-locked profiles.
**Date:** 2026-05-07

## D-010: Single protocol-owned vault instead of per-lender vaults
**Decision:** strand-credit maintains a single `ProtocolVault` PDA. Lenders deposit USDC as insurance. Loans are issued from this shared vault. Interest accrues to protocol (future revenue).
**Alternatives:** Per-lender vaults; RWA collateral model; peer-to-peer lending
**Reason:** Simpler, cheaper on-chain; works with limited Solana accounts in 10-minute demo window. Post-hackathon can migrate to peer-lender model for scalability.
**Date:** 2026-05-07

## D-011: Gig-worker scoring formula (6 components, max 1000 points)
**Decision:** Score = delivery_volume (200) + earnings_consistency (150) + tenure_months (150) + rating_points (200) + cross_platform_count (150) + repayment_history (150). All integer math on-chain.
**Alternatives:** Machine learning scoring; weighted by platform reputation; skill-only scoring
**Reason:** Simple, auditable, trustless. Reflects gig work reality: volume + reliability + reputation across platforms = creditworthiness. Credit limit = (score - 400) × $10 USDC.
**Date:** 2026-05-07

## D-012: Registration stake (0.1 SOL) required to prevent sybil attacks
**Decision:** Worker must lock 0.1 SOL (~$5 USD) in `WorkerProfile` on `register_worker` to create account. Withdrawable after 30 days or upon account closure.
**Alternatives:** No stake; captcha; social proof; email verification
**Reason:** On-chain sybil protection without external dependencies. 0.1 SOL is trivial for real gig workers (single job earnings) but expensive for spam bots. Aligns with real Web3 UX.
**Date:** 2026-05-07

---
*Last updated: 2026-05-07 11:15 IST (Gig Worker Rebuild for Colosseum Frontier)*
