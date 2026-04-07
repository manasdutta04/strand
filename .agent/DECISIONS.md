# Strand — Design Decisions Log

Each entry format:
**Decision:** What was decided
**Alternatives:** What else was considered  
**Reason:** Why this was chosen
**Date:** When decided

---

## D-001: Local Ollama instead of cloud LLM API for skill oracle
**Decision:** Use Ollama running locally (llama3.2 or mistral) for skill validation
**Alternatives:** Claude API, OpenAI API, Gemini API
**Reason:** No API key required, no per-call cost, works fully offline, no data leaves
the machine — important for a protocol handling professional credentials. Also avoids
external dependency for hackathon demo (no rate limits, no cold starts).
**Date:** 2026-04-07

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

<!-- Add new decisions here as you make them during the build -->

---
*Last updated: 2026-04-07 08:51 IST*
