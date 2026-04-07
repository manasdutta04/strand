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

describe("strand-credit", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const coreProgram: any = anchor.workspace.StrandCore;
  const scoreProgram: any = anchor.workspace.StrandScore;
  const creditProgram: any = anchor.workspace.StrandCredit;

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

  async function airdrop(pubkey: PublicKey, sol = 3): Promise<void> {
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

  function skillPda(worker: PublicKey, skill: string): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("skill"), worker.toBuffer(), Buffer.from(skill)],
      scoreProgram.programId
    )[0];
  }

  function creditLinePda(lender: PublicKey, worker: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("credit_line"), lender.toBuffer(), worker.toBuffer()],
      creditProgram.programId
    )[0];
  }

  function lenderVaultPda(lender: PublicKey, worker: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lender_vault"), lender.toBuffer(), worker.toBuffer()],
      creditProgram.programId
    )[0];
  }

  function loanPda(lender: PublicKey, worker: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("loan"), lender.toBuffer(), worker.toBuffer()],
      creditProgram.programId
    )[0];
  }

  async function initWorker(worker: Keypair): Promise<PublicKey> {
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

  async function attestForScore(worker: PublicKey, tags: string[]): Promise<void> {
    for (let i = 0; i < tags.length; i += 1) {
      await scoreProgram.methods
        .attestSkill(worker, tags[i], 85, Array.from(Uint8Array.from(Array(32).fill(i + 1))))
        .accounts({
          payer: payer.publicKey,
          oracle: oracle.publicKey,
          skillAttestation: skillPda(worker, tags[i]),
          systemProgram: SystemProgram.programId
        })
        .signers([oracle])
        .rpc();
    }
  }

  async function computeScore(worker: PublicKey, profile: PublicKey, tags: string[]): Promise<void> {
    await scoreProgram.methods
      .computeScore(worker)
      .accounts({
        payer: payer.publicKey,
        scoreState: scoreStatePda(worker),
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts(
        [profile, ...tags.map((tag) => skillPda(worker, tag))].map((pubkey) => ({
          pubkey,
          isSigner: false,
          isWritable: false
        }))
      )
      .rpc();
  }

  async function openCreditLine(params: {
    lender: Keypair;
    worker: PublicKey;
    usdcMint: PublicKey;
    lenderTokenAccount: PublicKey;
    max: BN;
    minScore: number;
  }): Promise<void> {
    await creditProgram.methods
      .openCreditLine(params.max, 1800, params.minScore)
      .accounts({
        lender: params.lender.publicKey,
        worker: params.worker,
        creditLine: creditLinePda(params.lender.publicKey, params.worker),
        lenderVault: lenderVaultPda(params.lender.publicKey, params.worker),
        lenderTokenAccount: params.lenderTokenAccount,
        usdcMint: params.usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([params.lender])
      .rpc();
  }

  it("open_credit_line creates CreditLine and funds lender vault", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 100
    });

    const vaultBalance = await getAccount(
      provider.connection,
      lenderVaultPda(lender.publicKey, worker.publicKey)
    );
    const line = await creditProgram.account.creditLine.fetch(
      creditLinePda(lender.publicKey, worker.publicKey)
    );

    assert.equal(Number(vaultBalance.amount), usdc(5_000).toNumber());
    assert.equal(line.maxUsdc.toNumber(), usdc(5_000).toNumber());
  });

  it("borrow succeeds when score >= minimum", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const profile = await initWorker(worker);
    await attestForScore(worker.publicKey, ["React", "TypeScript", "Solana", "Rust", "Node"]);
    await computeScore(worker.publicKey, profile, ["React", "TypeScript", "Solana", "Rust", "Node"]);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 60
    });

    await creditProgram.methods
      .borrow(usdc(200))
      .accounts({
        worker: worker.publicKey,
        lender: lender.publicKey,
        creditLine: creditLinePda(lender.publicKey, worker.publicKey),
        lenderVault: lenderVaultPda(lender.publicKey, worker.publicKey),
        workerTokenAccount: workerAta,
        scoreState: scoreStatePda(worker.publicKey),
        loanPosition: loanPda(lender.publicKey, worker.publicKey),
        usdcMint: mint,
        scoreProgram: scoreProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts([
        {
          pubkey: profile,
          isSigner: false,
          isWritable: false
        }
      ])
      .signers([worker])
      .rpc();

    const workerBal = await getAccount(provider.connection, workerAta);
    const loan = await creditProgram.account.loanPosition.fetch(
      loanPda(lender.publicKey, worker.publicKey)
    );

    assert.equal(Number(workerBal.amount), usdc(200).toNumber());
    assert.equal(loan.principal.toNumber(), usdc(200).toNumber());
  });

  it("borrow fails when score is below lender minimum", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const profile = await initWorker(worker);
    await attestForScore(worker.publicKey, ["React"]);
    await computeScore(worker.publicKey, profile, ["React"]);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 200
    });

    let threw = false;
    try {
      await creditProgram.methods
        .borrow(usdc(50))
        .accounts({
          worker: worker.publicKey,
          lender: lender.publicKey,
          creditLine: creditLinePda(lender.publicKey, worker.publicKey),
          lenderVault: lenderVaultPda(lender.publicKey, worker.publicKey),
          workerTokenAccount: workerAta,
          scoreState: scoreStatePda(worker.publicKey),
          loanPosition: loanPda(lender.publicKey, worker.publicKey),
          usdcMint: mint,
          scoreProgram: scoreProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .remainingAccounts([
          {
            pubkey: profile,
            isSigner: false,
            isWritable: false
          }
        ])
        .signers([worker])
        .rpc();
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });

  it("borrow fails when requested amount exceeds credit limit", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const profile = await initWorker(worker);
    await attestForScore(worker.publicKey, ["React", "TypeScript", "Solana", "Rust"]);
    await computeScore(worker.publicKey, profile, ["React", "TypeScript", "Solana", "Rust"]);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 0
    });

    let threw = false;
    try {
      await creditProgram.methods
        .borrow(usdc(3_000))
        .accounts({
          worker: worker.publicKey,
          lender: lender.publicKey,
          creditLine: creditLinePda(lender.publicKey, worker.publicKey),
          lenderVault: lenderVaultPda(lender.publicKey, worker.publicKey),
          workerTokenAccount: workerAta,
          scoreState: scoreStatePda(worker.publicKey),
          loanPosition: loanPda(lender.publicKey, worker.publicKey),
          usdcMint: mint,
          scoreProgram: scoreProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .remainingAccounts([
          {
            pubkey: profile,
            isSigner: false,
            isWritable: false
          }
        ])
        .signers([worker])
        .rpc();
    } catch {
      threw = true;
    }

    assert.isTrue(threw);
  });

  it("repay full closes LoanPosition and returns rent to worker", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const profile = await initWorker(worker);
    await attestForScore(worker.publicKey, ["React", "TypeScript", "Solana", "Rust", "Node"]);
    await computeScore(worker.publicKey, profile, ["React", "TypeScript", "Solana", "Rust", "Node"]);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 0
    });

    const line = creditLinePda(lender.publicKey, worker.publicKey);
    const vault = lenderVaultPda(lender.publicKey, worker.publicKey);
    const loan = loanPda(lender.publicKey, worker.publicKey);

    await creditProgram.methods
      .borrow(usdc(200))
      .accounts({
        worker: worker.publicKey,
        lender: lender.publicKey,
        creditLine: line,
        lenderVault: vault,
        workerTokenAccount: workerAta,
        scoreState: scoreStatePda(worker.publicKey),
        loanPosition: loan,
        usdcMint: mint,
        scoreProgram: scoreProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts([
        {
          pubkey: profile,
          isSigner: false,
          isWritable: false
        }
      ])
      .signers([worker])
      .rpc();

    await creditProgram.methods
      .repay(usdc(200))
      .accounts({
        worker: worker.publicKey,
        lender: lender.publicKey,
        creditLine: line,
        lenderVault: vault,
        workerTokenAccount: workerAta,
        loanPosition: loan,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([worker])
      .rpc();

    const maybeLoan = await creditProgram.account.loanPosition.fetchNullable(loan);
    assert.isNull(maybeLoan);
  });

  it("repay partial reduces outstanding principal", async () => {
    const lender = Keypair.generate();
    const worker = Keypair.generate();
    await airdrop(lender.publicKey);
    await airdrop(worker.publicKey);

    const profile = await initWorker(worker);
    await attestForScore(worker.publicKey, ["React", "TypeScript", "Solana", "Rust", "Node"]);
    await computeScore(worker.publicKey, profile, ["React", "TypeScript", "Solana", "Rust", "Node"]);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const lenderAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, lender.publicKey)
    ).address;
    const workerAta = (
      await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, worker.publicKey)
    ).address;
    await mintTo(provider.connection, payer, mint, lenderAta, payer, usdc(10_000).toNumber());

    await openCreditLine({
      lender,
      worker: worker.publicKey,
      usdcMint: mint,
      lenderTokenAccount: lenderAta,
      max: usdc(5_000),
      minScore: 0
    });

    const line = creditLinePda(lender.publicKey, worker.publicKey);
    const vault = lenderVaultPda(lender.publicKey, worker.publicKey);
    const loan = loanPda(lender.publicKey, worker.publicKey);

    await creditProgram.methods
      .borrow(usdc(300))
      .accounts({
        worker: worker.publicKey,
        lender: lender.publicKey,
        creditLine: line,
        lenderVault: vault,
        workerTokenAccount: workerAta,
        scoreState: scoreStatePda(worker.publicKey),
        loanPosition: loan,
        usdcMint: mint,
        scoreProgram: scoreProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts([
        {
          pubkey: profile,
          isSigner: false,
          isWritable: false
        }
      ])
      .signers([worker])
      .rpc();

    await creditProgram.methods
      .repay(usdc(100))
      .accounts({
        worker: worker.publicKey,
        lender: lender.publicKey,
        creditLine: line,
        lenderVault: vault,
        workerTokenAccount: workerAta,
        loanPosition: loan,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([worker])
      .rpc();

    const updatedLoan = await creditProgram.account.loanPosition.fetch(loan);
    assert.equal(updatedLoan.principal.toNumber(), usdc(200).toNumber());
  });
});
