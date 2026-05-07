import "dotenv/config";

import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isoNow, loadOracleKeypair, sleep, submitWorkRecord } from "./chain";
import { parsePdfToBase64, parseFileName, listPendingPdfs, archivePdf } from "./pdf-parser";
import { parseEarningsPdf } from "./worker-record-parser";

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

  const uploadsDir = process.env.UPLOADS_DIR || path.join(currentDir, "..", "uploads");
  const archiveDir = path.join(uploadsDir, "processed");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log(
    `[${isoNow()}] Oracle started (${process.env.LLM_PROVIDER || "ollama"} provider). Watching ${uploadsDir} for earnings PDFs.`
  );

  // Main polling loop: check for new PDFs every 5 seconds
  const processingSet = new Set<string>();
  const processLoop = setInterval(async () => {
    try {
      const pendingPdfs = await listPendingPdfs(uploadsDir);

      for (const pdfPath of pendingPdfs) {
        const fileName = path.basename(pdfPath);

        // Skip if already processing
        if (processingSet.has(fileName)) {
          continue;
        }

        processingSet.add(fileName);

        try {
          console.log(`[${isoNow()}] Found PDF: ${fileName}`);

          // Parse filename to get worker pubkey and platform
          const parsed = parseFileName(fileName);
          if (!parsed) {
            console.warn(`[${isoNow()}] Skipping: invalid filename format. Expected: {pubkey}_{platform}_{timestamp}.pdf`);
            continue;
          }

          const { workerPubkey: workerPubkeyStr, platform } = parsed;

          // Convert to PublicKey
          let workerKey: PublicKey;
          try {
            workerKey = new PublicKey(workerPubkeyStr);
          } catch {
            console.warn(`[${isoNow()}] Skipping: invalid worker pubkey ${workerPubkeyStr}`);
            continue;
          }

          // Parse PDF to base64
          const { base64 } = await parsePdfToBase64(pdfPath);

          // Extract earnings data using vision model
          console.log(`[${isoNow()}] Parsing earnings from ${platform}...`);
          const workRecord = await withRetry("parse_earnings", () =>
            parseEarningsPdf(base64, platform, fileName)
          );

          if (!workRecord.verified) {
            console.warn(
              `[${isoNow()}] Earnings extraction failed or unverified for ${fileName}`
            );
            // Archive even if not verified (for debugging)
            await archivePdf(pdfPath, archiveDir);
            continue;
          }

          console.log(
            `[${isoNow()}] Extracted: ${workRecord.earning_amount_usdc} USDC, ${workRecord.delivery_count} deliveries from ${platform}`
          );

          // Submit work record to blockchain via CPI
          console.log(`[${isoNow()}] Submitting work record to chain...`);
          const txSig = await withRetry("submit_work_record", () =>
            submitWorkRecord(
              workerKey,
              Math.round(workRecord.earning_amount_usdc * 1_000_000), // Convert to 6-decimal USDC
              workRecord.delivery_count,
              platform,
              coreProgram,
              scoreProgram,
              oracleKeypair
            )
          );

          console.log(`[${isoNow()}] Work record submitted: ${txSig}`);

          // Archive the processed PDF
          await archivePdf(pdfPath, archiveDir);
          console.log(`[${isoNow()}] Archived: ${fileName}`);
        } catch (error) {
          console.error(
            `[${isoNow()}] Error processing ${fileName}:`,
            error instanceof Error ? error.message : error
          );
        } finally {
          processingSet.delete(fileName);
        }
      }
    } catch (error) {
      console.error(`[${isoNow()}] Process loop error:`, error);
    }
  }, 5_000); // Check every 5 seconds

  const cleanup = async (): Promise<void> => {
    clearInterval(processLoop);
  };

  process.on("SIGINT", async () => {
    console.log(`[${isoNow()}] Shutting down...`);
    await cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log(`[${isoNow()}] Shutting down...`);
    await cleanup();
    process.exit(0);
  });

  await new Promise(() => {
    // Keeps the process alive
  });
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] oracle boot failure`, error);
  process.exit(1);
});
