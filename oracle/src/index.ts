import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeWorkSample } from "./grader";
import { getScoreState, isoNow, loadOracleKeypair, sleep } from "./chain";

type AnyProgram = anchor.Program<any>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function loadIdl(filePath: string): anchor.Idl {
  if (!fs.existsSync(filePath)) {
    throw new Error(`IDL not found at ${filePath}. Run anchor build first.`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as anchor.Idl;
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const backoffs = [1_000, 2_000, 4_000];
  let lastError: unknown;

  for (let attempt = 0; attempt < backoffs.length; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(
        `[${isoNow()}] ${label} failed (attempt ${attempt + 1}/${backoffs.length}):`,
        error
      );
      if (attempt < backoffs.length - 1) {
        await sleep(backoffs[attempt]);
      }
    }
  }

  throw lastError;
}

function toEvidenceHash(payload: string): number[] {
  const digest = crypto.createHash("sha256").update(payload).digest();
  return Array.from(digest.subarray(0, 32));
}

async function main(): Promise<void> {
  const rpcUrl = process.env.ANCHOR_PROVIDER_URL ?? "https://api.devnet.solana.com";
  const wsEndpoint = rpcUrl.replace("https://", "wss://").replace("http://", "ws://");
  const connection = new Connection(rpcUrl, { commitment: "confirmed", wsEndpoint });

  const oracleKeypair = loadOracleKeypair();
  const wallet = new anchor.Wallet(oracleKeypair);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  anchor.setProvider(provider);

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const rootDir = path.resolve(currentDir, "..", "..");
  const coreIdl = loadIdl(path.join(rootDir, "target", "idl", "strand_core.json"));
  const scoreIdl = loadIdl(path.join(rootDir, "target", "idl", "strand_score.json"));

  const coreProgramId = new PublicKey(requireEnv("STRAND_CORE_PROGRAM_ID"));
  const scoreProgramId = new PublicKey(requireEnv("STRAND_SCORE_PROGRAM_ID"));

  (coreIdl as any).address = coreProgramId.toBase58();
  (scoreIdl as any).address = scoreProgramId.toBase58();

  const coreProgram: any = new anchor.Program(coreIdl as any, provider as any);
  const scoreProgram: any = new anchor.Program(scoreIdl as any, provider as any);

  const computeScore = async (workerKey: PublicKey): Promise<string> => {
    const [scoreStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("score"), workerKey.toBuffer()],
      scoreProgram.programId
    );
    const [workerProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), workerKey.toBuffer()],
      coreProgram.programId
    );

    return withRetry("compute_score", async () => {
      const signature = await (scoreProgram as any).methods
        .computeScore(workerKey)
        .accounts({
          payer: wallet.publicKey,
          scoreState: scoreStatePda,
          systemProgram: SystemProgram.programId
        })
        .remainingAccounts([
          {
            pubkey: workerProfilePda,
            isSigner: false,
            isWritable: false
          }
        ])
        .rpc();

      return signature as string;
    });
  };

  const attestSkill = async (
    workerKey: PublicKey,
    skillTag: string,
    confidence: number,
    evidencePayload: string
  ): Promise<string | null> => {
    if (skillTag.length === 0 || skillTag.length > 32) {
      console.warn(
        `[${isoNow()}] skipping attest_skill for invalid seed-length tag: ${skillTag}`
      );
      return null;
    }

    const [skillAttestationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("skill"), workerKey.toBuffer(), Buffer.from(skillTag)],
      scoreProgram.programId
    );

    return withRetry("attest_skill", async () => {
      const signature = await scoreProgram.methods
        .attestSkill(workerKey, skillTag, confidence, toEvidenceHash(evidencePayload))
        .accounts({
          payer: wallet.publicKey,
          oracle: wallet.publicKey,
          skillAttestation: skillAttestationPda,
          systemProgram: SystemProgram.programId
        })
        .rpc();

      return signature as string;
    });
  };

  const workCompletedListener = coreProgram.addEventListener(
    "WorkCompleted",
    async (event: any, _slot: number, signature: string) => {
      const workerKey = new PublicKey(event.worker);
      console.log(
        `[${isoNow()}] WorkCompleted event received for worker ${workerKey.toBase58()} (tx: ${signature})`
      );

      const tx = await computeScore(workerKey);
      console.log(`[${isoNow()}] compute_score tx: ${tx}`);
    }
  );

  const skillClaimListener = coreProgram.addEventListener(
    "SkillClaim",
    async (event: any, _slot: number, signature: string) => {
      const workerKey = new PublicKey(event.worker);
      const claimedSkill = String(event.skillTag ?? "").trim();
      const workSampleUrl = String(event.workSampleUrl ?? "").trim();

      console.log(
        `[${isoNow()}] SkillClaim event received for worker ${workerKey.toBase58()} (tx: ${signature})`
      );

      const grade = await withRetry("grade_work_sample", () =>
        gradeWorkSample(workSampleUrl, claimedSkill ? [claimedSkill] : [])
      );

      for (let i = 0; i < grade.verified_skills.length; i += 1) {
        const verifiedSkill = grade.verified_skills[i];
        const confidence = Math.max(0, Math.min(100, Math.trunc(grade.confidences[i] ?? 0)));

        if (confidence < 65) {
          continue;
        }

        const tx = await attestSkill(
          workerKey,
          verifiedSkill,
          confidence,
          `${workSampleUrl}:${verifiedSkill}`
        );

        if (tx) {
          console.log(`[${isoNow()}] attest_skill(${verifiedSkill}) tx: ${tx}`);
        }
      }

      const scoreTx = await computeScore(workerKey);
      console.log(`[${isoNow()}] compute_score tx: ${scoreTx}`);

      const scoreState = await getScoreState(workerKey, scoreProgram);
      console.log(`[${isoNow()}] latest score state:`, scoreState);
    }
  );

  console.log(
    `[${isoNow()}] Oracle started. Listening to WorkCompleted and SkillClaim events.`
  );

  const cleanup = async (): Promise<void> => {
    coreProgram.removeEventListener(workCompletedListener);
    coreProgram.removeEventListener(skillClaimListener);
  };

  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });

  await new Promise(() => {
    // Keeps the process alive while subscriptions are active.
  });
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] oracle boot failure`, error);
  process.exit(1);
});
