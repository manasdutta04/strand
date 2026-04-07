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
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";

describe("strand-score", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const coreProgram: any = anchor.workspace.StrandCore;
  const scoreProgram: any = anchor.workspace.StrandScore;
  const payer = (provider.wallet as any).payer as Keypair;

  const oracle = Keypair.fromSecretKey(
    Uint8Array.from([
      52, 129, 188, 191, 119, 133, 222, 152, 244, 62, 42, 231, 133, 171, 244, 205, 157, 127,
      148, 247, 118, 153, 116, 216, 218, 87, 224, 192, 49, 59, 243, 61, 129, 212, 67, 235, 154,
      145, 158, 116, 126, 218, 159, 74, 110, 92, 149, 8, 110, 13, 89, 21, 148, 240, 245, 127,
      104, 135, 209, 93, 216, 31, 2, 151
    ])
  );

  const usdc = (amount: number): BN => new BN(Math.floor(amount * 1_000_000));

  async function airdrop(pubkey: PublicKey, sol = 2): Promise<void> {
    const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  function workerProfilePda(worker: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), worker.toBuffer()],
      coreProgram.programId
    )[0];
  }

  function scoreStatePda(worker: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("score"), worker.toBuffer()],
      scoreProgram.programId
    )[0];
  }

  function skillPda(worker: PublicKey, tag: string): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("skill"), worker.toBuffer(), Buffer.from(tag)],
      scoreProgram.programId
    )[0];
  }

  async function initWorkerProfile(worker: Keypair): Promise<PublicKey> {
    const profile = workerProfilePda(worker.publicKey);
    await coreProgram.methods
      .initializeWorkerProfile()
      .accounts({
        worker: worker.publicKey,
        workerProfile: profile,
        systemProgram: SystemProgram.programId
      })
      .signers([worker])
      .rpc();
    return profile;
  }

  async function computeScore(worker: PublicKey, remaining: PublicKey[]): Promise<void> {
    await scoreProgram.methods
      .computeScore(worker)
      .accounts({
        payer: payer.publicKey,
        scoreState: scoreStatePda(worker),
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts(
        remaining.map((pubkey) => ({
          pubkey,
          isWritable: false,
          isSigner: false
        }))
      )
      .rpc();
  }

  async function attestSkill(worker: PublicKey, tag: string, confidence: number): Promise<void> {
    await scoreProgram.methods
      .attestSkill(worker, tag, confidence, Array.from(Uint8Array.from(Array(32).fill(5))))
      .accounts({
        payer: payer.publicKey,
        oracle: oracle.publicKey,
        skillAttestation: skillPda(worker, tag),
        systemProgram: SystemProgram.programId
      })
      .signers([oracle])
      .rpc();
  }

  it("compute_score with fresh profile (0 jobs) returns 0", async () => {
    const worker = Keypair.generate();
    await airdrop(worker.publicKey);

    const profile = await initWorkerProfile(worker);
    await computeScore(worker.publicKey, [profile]);

    const scoreState = await scoreProgram.account.scoreState.fetch(scoreStatePda(worker.publicKey));
    assert.equal(scoreState.score, 0);
  });

  it("compute_score after 10 jobs of $1000 gives score > 100", async () => {
    const worker = Keypair.generate();
    const client = Keypair.generate();
    await airdrop(worker.publicKey, 3);
    await airdrop(client.publicKey, 3);

    const profile = await initWorkerProfile(worker);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const clientAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, client.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, clientAta, payer, usdc(20_000).toNumber());

    for (let i = 0; i < 10; i += 1) {
      const jobId = i + 100;
      const escrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          client.publicKey.toBuffer(),
          new BN(jobId).toArrayLike(Buffer, "le", 8)
        ],
        coreProgram.programId
      )[0];
      const escrowToken = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow_token"),
          client.publicKey.toBuffer(),
          new BN(jobId).toArrayLike(Buffer, "le", 8)
        ],
        coreProgram.programId
      )[0];
      const workNft = PublicKey.findProgramAddressSync(
        [
          Buffer.from("work_nft"),
          worker.publicKey.toBuffer(),
          new BN(jobId).toArrayLike(Buffer, "le", 8)
        ],
        coreProgram.programId
      )[0];

      await coreProgram.methods
        .createJob(
          new BN(jobId),
          usdc(1_000),
          ["TypeScript"],
          Array.from(Uint8Array.from(Array(32).fill(2)))
        )
        .accounts({
          client: client.publicKey,
          worker: worker.publicKey,
          escrow,
          escrowTokenAccount: escrowToken,
          clientTokenAccount: clientAta,
          usdcMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([client])
        .rpc();

      await coreProgram.methods
        .completeJob(new BN(jobId), Array.from(Uint8Array.from(Array(32).fill(3))), 5)
        .accounts({
          client: client.publicKey,
          worker: worker.publicKey,
          escrow,
          escrowTokenAccount: escrowToken,
          workerTokenAccount: workerAta,
          usdcMint: mint,
          workNft,
          workerProfile: profile,
          scoreProgram: scoreProgram.programId,
          scoreState: scoreStatePda(worker.publicKey),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([client, worker])
        .rpc();
    }

    const state = await scoreProgram.account.scoreState.fetch(scoreStatePda(worker.publicKey));
    assert.isAbove(state.score, 100);
  });

  it("attest_skill from oracle keypair creates SkillAttestation", async () => {
    const worker = Keypair.generate();
    await airdrop(worker.publicKey);

    await attestSkill(worker.publicKey, "React", 88);

    const account = await scoreProgram.account.skillAttestation.fetch(skillPda(worker.publicKey, "React"));
    assert.equal(account.worker.toBase58(), worker.publicKey.toBase58());
    assert.equal(account.skillTag, "React");
    assert.equal(account.confidence, 88);
  });

  it("attest_skill from non-oracle signer fails", async () => {
    const worker = Keypair.generate();
    const rogue = Keypair.generate();

    await airdrop(worker.publicKey);
    await airdrop(rogue.publicKey);

    let threw = false;
    try {
      await scoreProgram.methods
        .attestSkill(worker.publicKey, "Rust", 77, Array.from(Uint8Array.from(Array(32).fill(8))))
        .accounts({
          payer: payer.publicKey,
          oracle: rogue.publicKey,
          skillAttestation: skillPda(worker.publicKey, "Rust"),
          systemProgram: SystemProgram.programId
        })
        .signers([rogue])
        .rpc();
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });

  it("compute_score increases after 3 skill attestations", async () => {
    const worker = Keypair.generate();
    await airdrop(worker.publicKey, 3);

    const profile = await initWorkerProfile(worker);

    await computeScore(worker.publicKey, [profile]);
    const before = await scoreProgram.account.scoreState.fetch(scoreStatePda(worker.publicKey));

    const tags = ["React", "TypeScript", "Solana"];
    for (let i = 0; i < tags.length; i += 1) {
      await attestSkill(worker.publicKey, tags[i], 90 - i * 5);
    }

    await computeScore(worker.publicKey, [
      profile,
      skillPda(worker.publicKey, "React"),
      skillPda(worker.publicKey, "TypeScript"),
      skillPda(worker.publicKey, "Solana")
    ]);

    const after = await scoreProgram.account.scoreState.fetch(scoreStatePda(worker.publicKey));
    assert.isAbove(after.score, before.score);
  });
});
