# Strand Production Deployment Runbook

## Pre-Flight Checklist

### Security
- [ ] All API keys are stored in environment variables, never in code
- [ ] Wallet private key is stored securely (encrypted, restricted permissions)
- [ ] Oracle keypair lacks multisig protection (consider for production later)
- [ ] RPC endpoint is production-grade (not rate-limited, 99.9% uptime)
- [ ] All external API calls use HTTPS
- [ ] Rate limiting is configured for external API providers

### Environment
- [ ] `ANCHOR_PROVIDER_URL` points to production endpoint
- [ ] `LLM_PROVIDER` is set to cloud provider (not local Ollama)
- [ ] All required API keys are present in `oracle/.env`:
  - `OPENAI_API_KEY` or `GROQ_API_KEY` or `GEMINI_API_KEY` or `ANTHROPIC_API_KEY`
  - `ORACLE_KEYPAIR_PATH` (absolute path to secure keypair)
- [ ] `STRAND_CORE_PROGRAM_ID`, `STRAND_SCORE_PROGRAM_ID`, `STRAND_CREDIT_PROGRAM_ID` match mainnet
- [ ] IDL files are generated from latest program code

### Application
- [ ] All audit logs are enabled and persisted
- [ ] Error tracking and alerting is configured
- [ ] Health check endpoint is exposed and monitored
- [ ] Graceful shutdown handlers are in place
- [ ] Rate limiting is configured for incoming events

---

## Deployment Steps

### 1. Build and Verify
```bash
# From project root
cd oracle
npm ci  # Use exact versions
npm run build
npm run lint
npm run typecheck
```

### 2. Test Health Checks
```bash
# Verify oracle can connect to chain and LLM
npm run test:health
```

### 3. Start Oracle (Production)
```bash
# Start with process manager (e.g., PM2) for auto-restarts
npm run start:prod

# Or with PM2:
pm2 start oracle/dist/index.js --name strand-oracle --auto-restart
```

### 4. Monitor Logs
```bash
# Stream structured logs to monitoring service
pm2 logs strand-oracle | <send-to-monitoring>

# Check health status
curl http://localhost:3000/health
```

---

## Production Monitoring

### Key Metrics
- **Event Processing Latency:** time from event emission to oracle attestation
- **LLM Provider Response Time:** grade_work_sample() duration
- **Error Rate:** failed events / total events
- **Health Check Status:** chain, LLM, wallet connectivity

### Alert Thresholds
- LLM provider latency > 60s → warn
- Error rate > 5% → critical
- Health check failure (any component) → immediate alert
- Wallet balance < 1 SOL → warn

### Logs to Monitor
```json
{
  "level": "error",
  "component": "event_listener",
  "message": "WorkCompleted listener failed for tx xxx",
  "error": "Network timeout"
}
```

---

## Rollback Procedure

If production oracle encounters critical issues:

1. Stop oracle process: `pm2 stop strand-oracle`
2. Revert code to last known good: `git revert <commit>`
3. Restart: `pm2 start strand-oracle`
4. Verify health: `curl http://localhost:3000/health`

**Note:** On-chain state is immutable. Rollback only stops accepting new events; already-processed events remain on-chain.

---

## Maintenance

### Daily
- [ ] Monitor error rate and alert thresholds
- [ ] Check wallet balance
- [ ] Review health check logs

### Weekly
- [ ] Analyze event processing latency trends
- [ ] Review LLM provider performance and costs
- [ ] Check for failed event backlog

### Monthly
- [ ] Update dependencies and security patches
- [ ] Audit API key rotation
- [ ] Performance optimization review
