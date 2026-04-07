import fs from "node:fs";
import path from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature
} from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

export function isoNow(): string {
  return new Date().toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function loadOracleKeypair(): Keypair {
  const configuredPath = process.env.ORACLE_KEYPAIR_PATH;
  if (!configuredPath) {
    throw new Error("ORACLE_KEYPAIR_PATH is required");
  }

  const absolutePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Oracle keypair not found at ${absolutePath}`);
  }

  const keypairData = JSON.parse(fs.readFileSync(absolutePath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(keypairData));
}

export async function sendAndConfirm(
  connection: Connection,
  tx: Transaction,
  signers: Signer[],
  options: SendOptions = { preflightCommitment: "confirmed", maxRetries: 3 }
): Promise<TransactionSignature> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latest.blockhash;
      tx.lastValidBlockHeight = latest.lastValidBlockHeight;
      tx.feePayer = signers[0]?.publicKey;
      tx.sign(...signers);

      const signature = await connection.sendRawTransaction(tx.serialize(), options);
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight
        },
        "confirmed"
      );
      return signature;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const shouldRetry =
        message.toLowerCase().includes("blockhash") ||
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("already processed");

      if (!shouldRetry || attempt === 3) {
        break;
      }

      await sleep(250 * attempt);
    }
  }

  throw new Error(`sendAndConfirm failed: ${String(lastError)}`);
}

export async function getScoreState(
  worker: PublicKey,
  scoreProgram: Program
): Promise<unknown | null> {
  const [scoreStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("score"), worker.toBuffer()],
    scoreProgram.programId
  );

  const account = await scoreProgram.account.scoreState.fetchNullable(scoreStatePda);
  return account ?? null;
}
