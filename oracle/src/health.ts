import { Connection, PublicKey } from "@solana/web3.js";
import { gradeWorkSample } from "./grader";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    chain_connectivity: boolean;
    llm_provider: boolean;
    oracle_wallet: boolean;
  };
  last_event_at?: string;
  error_messages: string[];
}

export interface HealthCheckConfig {
  connection: Connection;
  oracleWalletKey: PublicKey;
  scoreProgramId: PublicKey;
  coreProgramId: PublicKey;
}

export async function runHealthCheck(config: HealthCheckConfig): Promise<HealthStatus> {
  const errors: string[] = [];
  const checks = {
    chain_connectivity: false,
    llm_provider: false,
    oracle_wallet: false
  };

  // Check chain connectivity
  try {
    const balance = await config.connection.getBalance(config.oracleWalletKey);
    if (balance > 0) {
      checks.chain_connectivity = true;
    } else {
      errors.push("Oracle wallet has insufficient SOL balance");
    }
  } catch (error) {
    errors.push(`Chain connectivity check failed: ${String(error)}`);
  }

  // Check LLM provider (test grading)
  try {
    const testResult = await gradeWorkSample("https://github.com/example/repo", ["test"]);
    if (testResult && Array.isArray(testResult.verified_skills)) {
      checks.llm_provider = true;
    }
  } catch (error) {
    errors.push(`LLM provider check failed: ${String(error)}`);
  }

  // Check oracle wallet existence  
  try {
    const accountInfo = await config.connection.getAccountInfo(config.oracleWalletKey);
    if (accountInfo) {
      checks.oracle_wallet = true;
    }
  } catch (error) {
    errors.push(`Oracle wallet check failed: ${String(error)}`);
  }

  const allHealthy = Object.values(checks).every((v) => v);
  const someFailing = Object.values(checks).some((v) => !v);

  return {
    status: allHealthy ? "healthy" : someFailing ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
    error_messages: errors
  };
}
