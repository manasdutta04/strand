# Strand Production Security & Operations Checklist

## Code Security

- [ ] **Wallet Private Keys**: All private keys are stored outside version control
  - `oracle/` keypair loaded from `ORACLE_KEYPAIR_PATH` env var
  - Keypair file permissions set to 0600 (owner read-only)
- [ ] **API Keys**: All external API keys stored in `.env`, never logged or printed
  - OpenAI, Groq, Gemini, Anthropic keys verified as required
  - None of these appear in console output
- [ ] **Input Validation**: All user-provided inputs (URLs, skill tags) are validated
  - Skill tags: max 64 characters, alphanumeric + underscore
  - Work sample URLs: max 280 characters, HTTPS only
  - Claimed skills array: 1–8 items
- [ ] **JSON Parsing**: All JSON responses from LLM validated before use
  - `extractJsonObject()` ensures response contains valid JSON
  - `normalizeResult()` sanitizes confidence values (0–100 clamp)

## Financial Security

- [ ] **Oracle Wallet Balance**: Monitored to prevent failed transactions
  - Alert if balance drops below 1 SOL or transaction budget
  - Configured for auto-topup or manual refuel process
- [ ] **USDC Escrow**: Escrow accounts properly initialized and protected
  - Escrow accounts are PDA-owned (no private key control)
  - Only client and job worker can withdraw
- [ ] **Rate Limiting**: External API calls have timeout and retry limits
  - Timeout: 30 seconds per request
  - Retries: exponential backoff (1s, 2s, 4s)
  - Max cost per grading session: ~$0.10
- [ ] **Fee Estimation**: Grading costs are predictable per work sample
  - No unbounded loops or streaming responses
  - Max tokens per request: 600 (Claude), similar for others

## Chain Security

- [ ] **Wallet Auth Paths**: Only oracle wallet can call `attest_skill()` and `compute_score()`
  - Verified in smart contract constraints
  - No backdoors for unauthorized skill attestation
- [ ] **PDA Ownership**: All PDA accounts are correctly owned and initialized
  - Score state owner: `STRAND_SCORE_PROGRAM_ID`
  - Skill attestation owner: `STRAND_SCORE_PROGRAM_ID`
  - No cross-worker or cross-lender access
- [ ] **Signature Verification**: All transactions signed by oracle keypair
  - Transaction payee verified before submission
  - No transaction tampering post-signature
- [ ] **Event Source Verification**: Oracle events are emitted only by Strand programs
  - Event listeners filter by program ID
  - No reliance on untrusted external event sources

## Operational Security

- [ ] **Environment Segregation**: Dev, staging, and production use separate configs
  - Dev: local Ollama, devnet chain, test keypair
  - Staging: cloud LLM, devnet chain, staging keypair
  - Production: cloud LLM, mainnet chain, production keypair
- [ ] **Access Control**: Production oracle is restricted
  - Runs in isolated container / restricted VM
  - Only monitoring services can read logs
  - Only deployment automation can restart
- [ ] **Incident Response**: On-chain state remains valid even if oracle fails
  - Failed grading jobs do not corrupt on-chain state
  - Stale or missing attestations are handled gracefully by UI
- [ ] **Audit Trail**: All actions logged with structured JSON logs
  - Timestamp, component, event type, user/wallet ID captured
  - Logs retained for 90 days (S3, CloudWatch, etc.)

## Monitoring & Alerting

- [ ] **Health Checks**: Oracle exposes `/health` endpoint
  - Status: healthy | degraded | unhealthy
  - Checks: chain connectivity, LLM provider, wallet balance
- [ ] **Error Alerts**: Critical errors trigger immediate notification
  - LLM provider timeout > 60s
  - Chain RPC failure
  - Wallet balance < 1 SOL
  - Event processing error rate > 5%
- [ ] **Rate Limiting Alerts**: API quota warnings
  - OpenAI: alert at 80% daily spend
  - Groq: alert at 80% requests limit
  - Gemini: alert at 80% requests limit
  - Anthropic: alert at 80% requests limit

## Compliance & Documentation

- [ ] **Documentation**: Runbook covers deployment, monitoring, rollback
  - DEPLOY_RUNBOOK.md is maintained and tested
  - Security and privacy policies are documented
- [ ] **Testing**: Smoke tests verify critical paths end-to-end
  - Worker profile creation → attestation → score update
  - Score used in credit line decision
  - Full E2E test passes in staging before production
- [ ] **Change Log**: All production changes logged with reason
  - Rollout date, git commit, change description
  - Rollback procedure is ready (< 5 min to execute)

---

## Security Review Checklist

**Sign-off:** Both Manas (backend/oracle) and Priya (frontend) must approve:

- [ ] Manas: Oracle code passes security audit (wallets, API keys, auth)
- [ ] Priya: Frontend does not hardcode any secrets or private data
- [ ] Manas: Chain programs have been tested for constraint bypass
- [ ] Priya: User-facing routes properly guard role access
- [ ] Joint: No mock or test data leaks into production build
