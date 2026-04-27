import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";

describe("strand-core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const coreProgram: any = anchor.workspace.StrandCore;
  const scoreProgram: any = anchor.workspace.StrandScore;
  const payer = (provider.wallet as any).payer as Keypair;

  const usdc = (amount: number): BN => new BN(Math.floor(amount * 1_000_000));

  let worker: Keypair;
  let client: Keypair;
  let usdcMint: PublicKey;
  let clientUsdcAta: PublicKey;
  let workerUsdcAta: PublicKey;
  let workerProfilePda: PublicKey;

  const workHash = Uint8Array.from(Array.from({ length: 32 }, () => 7));
  const deliverableHash = Uint8Array.from(Array.from({ length: 32 }, () => 9));

  async function airdrop(pubkey: PublicKey, sol = 2): Promise<void> {
    const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  function deriveEscrow(jobId: number): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), client.publicKey.toBuffer(), new BN(jobId).toArrayLike(Buffer, "le", 8)],
      coreProgram.programId
    )[0];
  }

  function deriveEscrowVault(jobId: number): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow_vault"),
        client.publicKey.toBuffer(),
        new BN(jobId).toArrayLike(Buffer, "le", 8)
      ],
      coreProgram.programId
    )[0];
  }

  function deriveWorkNft(jobId: number): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("work_nft"), worker.publicKey.toBuffer(), new BN(jobId).toArrayLike(Buffer, "le", 8)],
      coreProgram.programId
    )[0];
  }

  function deriveScoreState(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("score"), worker.publicKey.toBuffer()],
      scoreProgram.programId
    )[0];
  }

  async function initializeFixture(): Promise<void> {
    worker = Keypair.generate();
    client = Keypair.generate();

    await airdrop(worker.publicKey);
    await airdrop(client.publicKey);

    usdcMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      6
    );

    const clientAtaInfo = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      usdcMint,
      client.publicKey
    );
    clientUsdcAta = clientAtaInfo.address;

    const workerAtaInfo = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      usdcMint,
      worker.publicKey
    );
    workerUsdcAta = workerAtaInfo.address;

    await mintTo(provider.connection, payer, usdcMint, clientUsdcAta, payer, usdc(10_000).toNumber());

    workerProfilePda = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), worker.publicKey.toBuffer()],
      coreProgram.programId
    )[0];

    await coreProgram.methods
      .initializeWorkerProfile()
      .accounts({
        worker: worker.publicKey,
        workerProfile: workerProfilePda,
        systemProgram: SystemProgram.programId
      })
      .signers([worker])
      .rpc();
  }

  async function createJob(jobId: number, amountUsdc: number): Promise<void> {
    await coreProgram.methods
      .createJob(
        new BN(jobId),
        usdc(amountUsdc),
        ["React"],
        Array.from(workHash)
      )
      .accounts({
        client: client.publicKey,
        worker: worker.publicKey,
        escrow: deriveEscrow(jobId),
        escrowTokenAccount: deriveEscrowVault(jobId),
        clientTokenAccount: clientUsdcAta,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([client])
      .rpc();
  }

  async function completeJob(
    jobId: number,
    rating: number,
    signers: Keypair[]
  ): Promise<void> {
    await coreProgram.methods
      .completeJob(new BN(jobId), Array.from(deliverableHash), rating)
      .accounts({
        client: client.publicKey,
        worker: worker.publicKey,
        escrow: deriveEscrow(jobId),
        escrowTokenAccount: deriveEscrowVault(jobId),
        workerTokenAccount: workerUsdcAta,
        usdcMint,
        workNft: deriveWorkNft(jobId),
        workerProfile: workerProfilePda,
        scoreProgram: scoreProgram.programId,
        scoreState: deriveScoreState(),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers(signers)
      .rpc();
  }

  beforeEach(async () => {
    await initializeFixture();
  });

  it("initialize_worker_profile creates profile with created_at", async () => {
    const profile = await coreProgram.account.workerProfile.fetch(workerProfilePda);
    assert.equal(profile.worker.toBase58(), worker.publicKey.toBase58());
    assert.isAbove(Number(profile.createdAt), 0);
  });

  it("create_job moves USDC from client to escrow token account", async () => {
    const clientBefore = await getAccount(provider.connection, clientUsdcAta);

    await createJob(1, 500);

    const clientAfter = await getAccount(provider.connection, clientUsdcAta);
    const escrowAfter = await getAccount(provider.connection, deriveEscrowVault(1));

    assert.equal(Number(escrowAfter.amount), usdc(500).toNumber());
    assert.equal(
      Number(clientBefore.amount) - Number(clientAfter.amount),
      usdc(500).toNumber()
    );
  });

  it("complete_job creates WorkNFT, pays worker, and updates profile", async () => {
    await createJob(2, 250);

    const workerBefore = await getAccount(provider.connection, workerUsdcAta);

    await completeJob(2, 5, [client, worker]);

    const workerAfter = await getAccount(provider.connection, workerUsdcAta);
    const profile = await coreProgram.account.workerProfile.fetch(workerProfilePda);
    const workNft = await coreProgram.account.workNft.fetch(deriveWorkNft(2));

    assert.equal(Number(workerAfter.amount) - Number(workerBefore.amount), usdc(250).toNumber());
    assert.equal(workNft.jobId.toNumber(), 2);
    assert.equal(profile.jobsCompleted.toNumber(), 1);
    assert.equal(profile.totalEarnedUsdc.toNumber(), usdc(250).toNumber());
  });

  it("complete_job fails with only worker signature", async () => {
    await createJob(3, 100);

    let threw = false;
    try {
      await completeJob(3, 4, [worker]);
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });

  it("complete_job fails with only client signature", async () => {
    await createJob(4, 100);

    let threw = false;
    try {
      await completeJob(4, 4, [client]);
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });

  it("open_dispute updates escrow state to Disputed", async () => {
    await createJob(5, 300);

    await coreProgram.methods
      .openDispute(new BN(5))
      .accounts({
        signer: client.publicKey,
        escrow: deriveEscrow(5)
      })
      .signers([client])
      .rpc();

    const escrow = await coreProgram.account.jobEscrow.fetch(deriveEscrow(5));
    assert.include(JSON.stringify(escrow.state).toLowerCase(), "disputed");
  });

  it("complete_job fails once escrow is disputed", async () => {
    await createJob(6, 400);

    await coreProgram.methods
      .openDispute(new BN(6))
      .accounts({
        signer: worker.publicKey,
        escrow: deriveEscrow(6)
      })
      .signers([worker])
      .rpc();

    let threw = false;
    try {
      await completeJob(6, 5, [client, worker]);
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });
});
