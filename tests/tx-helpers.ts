import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";
import {
  deriveCreditLinePda,
  deriveEscrowPda,
  deriveEscrowVaultPda,
  deriveLenderVaultPda,
  deriveLoanPositionPda,
  deriveScoreStatePda,
  deriveSkillAttestationPda,
  deriveWorkerProfilePda,
  deriveWorkNftPda,
  fromRawUsdc,
  validateBorrowRequest,
  validateClaimSkillRequest,
  validateCompleteJobRequest,
  validateCreateJobRequest,
  validateRepayRequest
} from "../app/src/lib/tx-helpers";

describe("tx-helpers", () => {
  const client = new PublicKey("11111111111111111111111111111111");
  const worker = new PublicKey("Vote111111111111111111111111111111111111111");
  const lender = new PublicKey("BPFLoader2111111111111111111111111111111111");

  it("derives deterministic PDAs", () => {
    const jobId = 42;

    const escrow = deriveEscrowPda(client, jobId);
    const escrowAgain = deriveEscrowPda(client, jobId);
    assert.equal(escrow.toBase58(), escrowAgain.toBase58());

    const escrowVault = deriveEscrowVaultPda(client, jobId);
    const workNft = deriveWorkNftPda(worker, jobId);
    const profile = deriveWorkerProfilePda(worker);
    const score = deriveScoreStatePda(worker);
    const skill = deriveSkillAttestationPda(worker, "React");
    const line = deriveCreditLinePda(lender, worker);
    const vault = deriveLenderVaultPda(lender, worker);
    const loan = deriveLoanPositionPda(lender, worker);

    assert.isTrue(PublicKey.isOnCurve(client.toBytes()));
    assert.notEqual(escrow.toBase58(), escrowVault.toBase58());
    assert.notEqual(workNft.toBase58(), profile.toBase58());
    assert.notEqual(score.toBase58(), skill.toBase58());
    assert.notEqual(line.toBase58(), vault.toBase58());
    assert.notEqual(vault.toBase58(), loan.toBase58());
  });

  it("converts raw USDC correctly", () => {
    assert.equal(fromRawUsdc(1_000_000), 1);
    assert.equal(fromRawUsdc(250_000), 0.25);
  });

  it("validates create job request boundaries", () => {
    assert.doesNotThrow(() =>
      validateCreateJobRequest({
        jobId: 1,
        worker,
        amountUsdc: 50,
        skillsRequired: ["React"],
        clientTokenAccount: client
      })
    );

    assert.throws(() =>
      validateCreateJobRequest({
        jobId: 1,
        worker,
        amountUsdc: 50,
        skillsRequired: [],
        clientTokenAccount: client
      })
    );
  });

  it("validates complete job constraints", () => {
    assert.doesNotThrow(() =>
      validateCompleteJobRequest({
        jobId: 2,
        worker,
        workerTokenAccount: client,
        clientRating: 5
      })
    );

    assert.throws(() =>
      validateCompleteJobRequest({
        jobId: 2,
        worker,
        workerTokenAccount: client,
        clientRating: 6
      })
    );
  });

  it("validates claim skill length limits", () => {
    assert.doesNotThrow(() =>
      validateClaimSkillRequest({
        worker,
        skillTag: "Solana",
        workSampleUrl: "https://example.com/work"
      })
    );

    assert.throws(() =>
      validateClaimSkillRequest({
        worker,
        skillTag: "",
        workSampleUrl: "https://example.com/work"
      })
    );
  });

  it("validates borrow/repay positive amounts", () => {
    assert.doesNotThrow(() =>
      validateBorrowRequest({
        lender,
        workerTokenAccount: client,
        amountUsdc: 10
      })
    );
    assert.doesNotThrow(() =>
      validateRepayRequest({
        lender,
        workerTokenAccount: client,
        amountUsdc: 10
      })
    );

    assert.throws(() =>
      validateBorrowRequest({
        lender,
        workerTokenAccount: client,
        amountUsdc: 0
      })
    );
    assert.throws(() =>
      validateRepayRequest({
        lender,
        workerTokenAccount: client,
        amountUsdc: -1
      })
    );
  });
});
