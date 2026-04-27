import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer
} from "@solana/spl-token";
import fs from "node:fs";
import path from "node:path";

const DEVNET_USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const USDC_SCALE = 1_000_000;

const JOB_AMOUNTS = [100, 250, 500, 200, 300] as const;
const SKILLS = [
  { tag: "React", confidence: 88 },
  { tag: "TypeScript", confidence: 92 },
  { tag: "Solana", confidence: 75 }
] as const;

function usdc(amount: number): anchor.BN {
  return new anchor.BN(Math.floor(amount * USDC_SCALE));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function loadOrGenerateKeypair(filePath: string): Keypair {
  if (fs.existsSync(filePath)) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }

  const kp = Keypair.generate();
  fs.writeFileSync(filePath, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

async function airdropWithRetry(
  connection: anchor.web3.Connection,
  pubkey: PublicKey,
  sol = 2
): Promise<void> {
  for (let i = 0; i < 3; i += 1) {
    try {
      const sig = await connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      return;
    } catch (error) {
      if (i === 2) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

async function fundDevnetUsdc(
  connection: anchor.web3.Connection,
  payer: Keypair,
  destinationOwner: PublicKey,
  amount: number
): Promise<PublicKey> {
  const destinationAta = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      DEVNET_USDC_MINT,
      destinationOwner
    )
  ).address;

  const payerAta = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      DEVNET_USDC_MINT,
      payer.publicKey
    )
  ).address;

  try {
    await mintTo(
      connection,
      payer,
      DEVNET_USDC_MINT,
      destinationAta,
      payer,
      amount * USDC_SCALE
    );
    return destinationAta;
  } catch {
    // Devnet USDC mint is not under local mint authority, so use transfer from payer balance.
  }

  await transfer(
    connection,
    payer,
    payerAta,
    destinationAta,
    payer,
    amount * USDC_SCALE
  );

  return destinationAta;
}

async function main(): Promise<void> {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = (provider.wallet as any).payer as Keypair;

  const root = process.cwd();
  const scriptsDir = path.join(root, "scripts");
  const oraclePath = path.join(root, "oracle", "oracle-keypair.json");

  const alice = loadOrGenerateKeypair(path.join(scriptsDir, "demo-alice.json"));
  const bob = loadOrGenerateKeypair(path.join(scriptsDir, "demo-bob.json"));
  const lender = loadOrGenerateKeypair(path.join(scriptsDir, "demo-lender.json"));
  const oracle = loadOrGenerateKeypair(oraclePath);

  const coreIdl = JSON.parse(
    fs.readFileSync(path.join(root, "target/idl/strand_core.json"), "utf8")
  ) as any;
  const scoreIdl = JSON.parse(
    fs.readFileSync(path.join(root, "target/idl/strand_score.json"), "utf8")
  ) as any;
  const creditIdl = JSON.parse(
    fs.readFileSync(path.join(root, "target/idl/strand_credit.json"), "utf8")
  ) as any;

  coreIdl.address = requireEnv("STRAND_CORE_PROGRAM_ID");
  scoreIdl.address = requireEnv("STRAND_SCORE_PROGRAM_ID");
  creditIdl.address = requireEnv("STRAND_CREDIT_PROGRAM_ID");

  const coreProgram = new anchor.Program(coreIdl, provider) as any;
  const scoreProgram = new anchor.Program(scoreIdl, provider) as any;
  const creditProgram = new anchor.Program(creditIdl, provider) as any;

  console.log("1) Loading demo keypairs and funding wallets...");
  await airdropWithRetry(provider.connection, alice.publicKey, 2);
  await airdropWithRetry(provider.connection, bob.publicKey, 2);
  await airdropWithRetry(provider.connection, oracle.publicKey, 2);
  await airdropWithRetry(provider.connection, lender.publicKey, 2);

  console.log("2) Funding Bob with 5000 USDC...");
  const bobAta = await fundDevnetUsdc(provider.connection, payer, bob.publicKey, 5000);

  console.log("3) Initializing Alice WorkerProfile...");
  const aliceProfilePda = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), alice.publicKey.toBuffer()],
    coreProgram.programId
  )[0];

  try {
    await coreProgram.methods
      .initializeWorkerProfile()
      .accounts({
        worker: alice.publicKey,
        workerProfile: aliceProfilePda,
        systemProgram: SystemProgram.programId
      })
      .signers([alice])
      .rpc();
  } catch {
    // Profile may already exist from previous seed run.
  }

  console.log("4) Creating and completing 5 jobs...");
  const aliceAta = (
    await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      DEVNET_USDC_MINT,
      alice.publicKey
    )
  ).address;

  const scoreStatePda = PublicKey.findProgramAddressSync(
    [Buffer.from("score"), alice.publicKey.toBuffer()],
    scoreProgram.programId
  )[0];

  for (let index = 0; index < JOB_AMOUNTS.length; index += 1) {
    const jobId = index + 1;
    const amount = JOB_AMOUNTS[index];
    const leJobId = new anchor.BN(jobId).toArrayLike(Buffer, "le", 8);

    const escrowPda = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), bob.publicKey.toBuffer(), leJobId],
      coreProgram.programId
    )[0];

    const escrowTokenPda = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_vault"), bob.publicKey.toBuffer(), leJobId],
      coreProgram.programId
    )[0];

    const workNftPda = PublicKey.findProgramAddressSync(
      [Buffer.from("work_nft"), alice.publicKey.toBuffer(), leJobId],
      coreProgram.programId
    )[0];

    await coreProgram.methods
      .createJob(
        new anchor.BN(jobId),
        usdc(amount),
        ["React", "TypeScript"],
        Array.from(Uint8Array.from(Array(32).fill(jobId)))
      )
      .accounts({
        client: bob.publicKey,
        worker: alice.publicKey,
        escrow: escrowPda,
        escrowTokenAccount: escrowTokenPda,
        clientTokenAccount: bobAta,
        usdcMint: DEVNET_USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([bob])
      .rpc();

    const completeTx = await coreProgram.methods
      .completeJob(
        new anchor.BN(jobId),
        Array.from(Uint8Array.from(Array(32).fill(jobId + 11))),
        5
      )
      .accounts({
        client: bob.publicKey,
        worker: alice.publicKey,
        escrow: escrowPda,
        escrowTokenAccount: escrowTokenPda,
        workerTokenAccount: aliceAta,
        usdcMint: DEVNET_USDC_MINT,
        workNft: workNftPda,
        workerProfile: aliceProfilePda,
        scoreProgram: scoreProgram.programId,
        scoreState: scoreStatePda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([bob, alice])
      .rpc();

    console.log(`   - Completed job ${jobId} ($${amount}), tx: ${completeTx}`);
  }

  console.log("5) Attesting skills for Alice...");
  for (const skill of SKILLS) {
    const skillPda = PublicKey.findProgramAddressSync(
      [Buffer.from("skill"), alice.publicKey.toBuffer(), Buffer.from(skill.tag)],
      scoreProgram.programId
    )[0];

    const tx = await scoreProgram.methods
      .attestSkill(
        alice.publicKey,
        skill.tag,
        skill.confidence,
        Array.from(Uint8Array.from(Array(32).fill(skill.confidence)))
      )
      .accounts({
        payer: payer.publicKey,
        oracle: oracle.publicKey,
        skillAttestation: skillPda,
        systemProgram: SystemProgram.programId
      })
      .signers([oracle])
      .rpc();

    console.log(`   - Attested ${skill.tag} (${skill.confidence}), tx: ${tx}`);
  }

  console.log("6) Recomputing score...");
  await scoreProgram.methods
    .computeScore(alice.publicKey)
    .accounts({
      payer: payer.publicKey,
      scoreState: scoreStatePda,
      systemProgram: SystemProgram.programId
    })
    .remainingAccounts([
      {
        pubkey: aliceProfilePda,
        isSigner: false,
        isWritable: false
      },
      ...SKILLS.map((skill) => ({
        pubkey: PublicKey.findProgramAddressSync(
          [Buffer.from("skill"), alice.publicKey.toBuffer(), Buffer.from(skill.tag)],
          scoreProgram.programId
        )[0],
        isSigner: false,
        isWritable: false
      }))
    ])
    .rpc();

  console.log("7) Funding lender and opening credit line...");
  const lenderAta = await fundDevnetUsdc(provider.connection, payer, lender.publicKey, 10_000);
  const lenderVaultPda = PublicKey.findProgramAddressSync(
    [Buffer.from("lender_vault"), lender.publicKey.toBuffer(), alice.publicKey.toBuffer()],
    creditProgram.programId
  )[0];
  const creditLinePda = PublicKey.findProgramAddressSync(
    [Buffer.from("credit_line"), lender.publicKey.toBuffer(), alice.publicKey.toBuffer()],
    creditProgram.programId
  )[0];

  await creditProgram.methods
    .openCreditLine(usdc(5_000), 1800, 100)
    .accounts({
      lender: lender.publicKey,
      worker: alice.publicKey,
      creditLine: creditLinePda,
      lenderVault: lenderVaultPda,
      lenderTokenAccount: lenderAta,
      usdcMint: DEVNET_USDC_MINT,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .signers([lender])
    .rpc();

  const scoreState = await scoreProgram.account.scoreState.fetch(scoreStatePda);
  const score = Number(scoreState.score);
  const creditLimit = score * 10;
  const apr = 24 - (score / 1000) * 12;
  const vaultBalance = await getAccount(provider.connection, lenderVaultPda);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo seeded successfully.");
  console.log(`Alice wallet: ${alice.publicKey.toBase58()}`);
  console.log(`Alice Strand Score: ${score}`);
  console.log(`Credit limit: $${creditLimit.toLocaleString()} USDC`);
  console.log(`APR: ${apr.toFixed(2)}%`);
  console.log(`Lender vault balance: $${(Number(vaultBalance.amount) / USDC_SCALE).toLocaleString()} USDC`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Now run: cd app && npm run dev");
}

main().catch((error) => {
  console.error("seed-demo failed", error);
  process.exit(1);
});
