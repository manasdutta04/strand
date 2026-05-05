import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { sha256 } from "@noble/hashes/sha2";
import {
  Commitment,
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  DEVNET_USDC_MINT,
  STRAND_CORE_PROGRAM_ID,
  STRAND_CREDIT_PROGRAM_ID,
  STRAND_SCORE_PROGRAM_ID
} from "./constants";
import { getPrograms } from "./programs";

const USDC_SCALE = 1_000_000;
const MAX_SKILLS = 8;
const MAX_SKILL_TAG_LENGTH = 64;
const MAX_SAMPLE_URL_LENGTH = 280;
const MAX_REPAY_OR_BORROW_USDC = 10_000_000;

type TxSendOptions = SendOptions & ConfirmOptions;

export type TxHelperErrorCode =
  | "InvalidWallet"
  | "InvalidAmount"
  | "MissingTokenAccount"
  | "ConstraintViolation"
  | "RpcFailure";

export class TxHelperError extends Error {
  constructor(
    public readonly code: TxHelperErrorCode,
    message: string,
    public readonly causeRaw?: unknown
  ) {
    super(message);
  }
}

export interface TxContext {
  connection: Connection;
  walletPublicKey: PublicKey;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: TxSendOptions
  ) => Promise<string>;
  commitment?: Commitment;
}

export interface TxBuildResult<TDerived extends object> {
  transaction: Transaction;
  instructions: TransactionInstruction[];
  derived: TDerived;
}

export interface TxExecuteResult<TDerived extends object> {
  signature: string;
  derived: TDerived;
}

export interface CreateJobRequest {
  jobId: number;
  worker: PublicKey;
  amountUsdc: number;
  skillsRequired: string[];
  clientTokenAccount: PublicKey;
  usdcMint?: PublicKey;
  workHash?: Uint8Array;
}

export interface CompleteJobRequest {
  jobId: number;
  worker: PublicKey;
  workerTokenAccount: PublicKey;
  clientRating: number;
  deliverableHash?: Uint8Array;
  usdcMint?: PublicKey;
}

export interface ClaimSkillRequest {
  worker: PublicKey;
  skillTag: string;
  workSampleUrl: string;
}

export interface BorrowRequest {
  lender: PublicKey;
  workerTokenAccount: PublicKey;
  amountUsdc: number;
  usdcMint?: PublicKey;
  includeScoreRecompute?: boolean;
  workerProfileForRecompute?: PublicKey;
  skillAttestationsForRecompute?: PublicKey[];
}

export interface RepayRequest {
  lender: PublicKey;
  workerTokenAccount: PublicKey;
  amountUsdc: number;
}

export interface CreateJobDerived {
  escrow: PublicKey;
  escrowTokenAccount: PublicKey;
}

export interface CompleteJobDerived {
  escrow: PublicKey;
  escrowTokenAccount: PublicKey;
  workNft: PublicKey;
  workerProfile: PublicKey;
  scoreState: PublicKey;
}

export interface ClaimSkillDerived {
  workerProfile: PublicKey;
}

export interface BorrowDerived {
  creditLine: PublicKey;
  lenderVault: PublicKey;
  loanPosition: PublicKey;
  scoreState: PublicKey;
}

export interface RepayDerived {
  creditLine: PublicKey;
  lenderVault: PublicKey;
  loanPosition: PublicKey;
}

function createReadOnlyProvider(context: TxContext): AnchorProvider {
  const wallet = {
    publicKey: context.walletPublicKey,
    signAllTransactions: async (txs: Transaction[]) => {
      void txs;
      throw new Error("signAllTransactions is not used by tx helpers.");
    },
    signTransaction: async (tx: Transaction) => {
      void tx;
      throw new Error("signTransaction is not used by tx helpers.");
    }
  };

  return new AnchorProvider(context.connection, wallet as never, {
    commitment: context.commitment ?? "confirmed"
  });
}

function normalizeError(error: unknown): TxHelperError {
  if (error instanceof TxHelperError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowered = message.toLowerCase();

  if (lowered.includes("constraint") || lowered.includes("unauthorized")) {
    return new TxHelperError("ConstraintViolation", message, error);
  }
  if (lowered.includes("token account") || lowered.includes("mint")) {
    return new TxHelperError("MissingTokenAccount", message, error);
  }
  return new TxHelperError("RpcFailure", message, error);
}

function ensureWalletPublicKey(publicKey: PublicKey | undefined): PublicKey {
  if (!publicKey) {
    throw new TxHelperError("InvalidWallet", "Wallet is not connected.");
  }
  return publicKey;
}

function toRawUsdc(amountUsdc: number): BN {
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0 || amountUsdc > MAX_REPAY_OR_BORROW_USDC) {
    throw new TxHelperError("InvalidAmount", `Invalid USDC amount: ${amountUsdc}`);
  }
  return new BN(Math.round(amountUsdc * USDC_SCALE));
}

function hashTo32Bytes(input: string): Uint8Array {
  const digest = sha256(new TextEncoder().encode(input));
  return Uint8Array.from(digest.subarray(0, 32));
}

function ensureHash32(hash?: Uint8Array, fallbackInput?: string): number[] {
  if (!hash && fallbackInput) {
    return Array.from(hashTo32Bytes(fallbackInput));
  }
  if (!hash) {
    return Array.from(Uint8Array.from({ length: 32 }, () => 0));
  }
  if (hash.length !== 32) {
    throw new TxHelperError("InvalidAmount", "Hash arguments must be exactly 32 bytes.");
  }
  return Array.from(hash);
}

interface MethodCall {
  accounts: (accounts: Record<string, unknown>) => MethodCall;
  remainingAccounts: (
    accounts: Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }>
  ) => MethodCall;
  instruction: () => Promise<TransactionInstruction>;
}

interface ProgramLike {
  methods: Record<string, (...args: unknown[]) => MethodCall>;
  programId: PublicKey;
}

export function deriveEscrowPda(client: PublicKey, jobId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), client.toBuffer(), new BN(jobId).toArrayLike(Buffer, "le", 8)],
    STRAND_CORE_PROGRAM_ID
  )[0];
}

export function deriveEscrowVaultPda(client: PublicKey, jobId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow_vault"), client.toBuffer(), new BN(jobId).toArrayLike(Buffer, "le", 8)],
    STRAND_CORE_PROGRAM_ID
  )[0];
}

export function deriveWorkNftPda(worker: PublicKey, jobId: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("work_nft"), worker.toBuffer(), new BN(jobId).toArrayLike(Buffer, "le", 8)],
    STRAND_CORE_PROGRAM_ID
  )[0];
}

export function deriveWorkerProfilePda(worker: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), worker.toBuffer()],
    STRAND_CORE_PROGRAM_ID
  )[0];
}

export function deriveScoreStatePda(worker: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("score"), worker.toBuffer()],
    STRAND_SCORE_PROGRAM_ID
  )[0];
}

export function deriveSkillAttestationPda(worker: PublicKey, skillTag: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("skill"), worker.toBuffer(), Buffer.from(skillTag)],
    STRAND_SCORE_PROGRAM_ID
  )[0];
}

export function deriveCreditLinePda(lender: PublicKey, worker: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("credit_line"), lender.toBuffer(), worker.toBuffer()],
    STRAND_CREDIT_PROGRAM_ID
  )[0];
}

export function deriveLenderVaultPda(lender: PublicKey, worker: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("lender_vault"), lender.toBuffer(), worker.toBuffer()],
    STRAND_CREDIT_PROGRAM_ID
  )[0];
}

export function deriveLoanPositionPda(lender: PublicKey, worker: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("loan"), lender.toBuffer(), worker.toBuffer()],
    STRAND_CREDIT_PROGRAM_ID
  )[0];
}

export function fromRawUsdc(raw: BN | number): number {
  const value = typeof raw === "number" ? raw : raw.toNumber();
  return value / USDC_SCALE;
}

export function validateCreateJobRequest(request: CreateJobRequest): void {
  if (request.jobId <= 0) {
    throw new TxHelperError("InvalidAmount", "jobId must be positive.");
  }
  if (request.skillsRequired.length === 0 || request.skillsRequired.length > MAX_SKILLS) {
    throw new TxHelperError("InvalidAmount", "skillsRequired must contain 1 to 8 skills.");
  }
  toRawUsdc(request.amountUsdc);
}

export function validateCompleteJobRequest(request: CompleteJobRequest): void {
  if (request.jobId <= 0) {
    throw new TxHelperError("InvalidAmount", "jobId must be positive.");
  }
  if (!Number.isInteger(request.clientRating) || request.clientRating < 1 || request.clientRating > 5) {
    throw new TxHelperError("InvalidAmount", "clientRating must be an integer from 1 to 5.");
  }
}

export function validateClaimSkillRequest(request: ClaimSkillRequest): void {
  if (request.skillTag.length === 0 || request.skillTag.length > MAX_SKILL_TAG_LENGTH) {
    throw new TxHelperError("InvalidAmount", "skillTag must be between 1 and 64 characters.");
  }
  if (request.workSampleUrl.length === 0 || request.workSampleUrl.length > MAX_SAMPLE_URL_LENGTH) {
    throw new TxHelperError("InvalidAmount", "workSampleUrl must be between 1 and 280 characters.");
  }
}

export function validateBorrowRequest(request: BorrowRequest): void {
  toRawUsdc(request.amountUsdc);
}

export function validateRepayRequest(request: RepayRequest): void {
  toRawUsdc(request.amountUsdc);
}

export async function buildCreateJobTx(
  context: TxContext,
  request: CreateJobRequest
): Promise<TxBuildResult<CreateJobDerived>> {
  try {
    validateCreateJobRequest(request);
    const client = ensureWalletPublicKey(context.walletPublicKey);
    const provider = createReadOnlyProvider(context);
    const { coreProgram } = getPrograms(provider);
    const core = coreProgram as unknown as ProgramLike;

    const derived: CreateJobDerived = {
      escrow: deriveEscrowPda(client, request.jobId),
      escrowTokenAccount: deriveEscrowVaultPda(client, request.jobId)
    };
    const usdcMint = request.usdcMint ?? DEVNET_USDC_MINT;

    const instruction = await core.methods
      .createJob(
        new BN(request.jobId),
        toRawUsdc(request.amountUsdc),
        request.skillsRequired,
        ensureHash32(request.workHash, `${request.jobId}:${request.worker.toBase58()}`)
      )
      .accounts({
        client,
        worker: request.worker,
        escrow: derived.escrow,
        escrowTokenAccount: derived.escrowTokenAccount,
        clientTokenAccount: request.clientTokenAccount,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = client;
    return { transaction, instructions: [instruction], derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function executeCreateJob(
  context: TxContext,
  request: CreateJobRequest,
  options?: TxSendOptions
): Promise<TxExecuteResult<CreateJobDerived>> {
  const built = await buildCreateJobTx(context, request);
  try {
    const signature = await context.sendTransaction(built.transaction, context.connection, options);
    return { signature, derived: built.derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function buildCompleteJobTx(
  context: TxContext,
  request: CompleteJobRequest
): Promise<TxBuildResult<CompleteJobDerived>> {
  try {
    validateCompleteJobRequest(request);
    const client = ensureWalletPublicKey(context.walletPublicKey);
    const provider = createReadOnlyProvider(context);
    const { coreProgram, scoreProgram } = getPrograms(provider);
    const core = coreProgram as unknown as ProgramLike;

    const derived: CompleteJobDerived = {
      escrow: deriveEscrowPda(client, request.jobId),
      escrowTokenAccount: deriveEscrowVaultPda(client, request.jobId),
      workNft: deriveWorkNftPda(request.worker, request.jobId),
      workerProfile: deriveWorkerProfilePda(request.worker),
      scoreState: deriveScoreStatePda(request.worker)
    };
    const usdcMint = request.usdcMint ?? DEVNET_USDC_MINT;

    const instruction = await core.methods
      .completeJob(
        new BN(request.jobId),
        ensureHash32(request.deliverableHash, `${request.jobId}:${request.worker.toBase58()}:deliverable`),
        request.clientRating
      )
      .accounts({
        client,
        worker: request.worker,
        escrow: derived.escrow,
        escrowTokenAccount: derived.escrowTokenAccount,
        workerTokenAccount: request.workerTokenAccount,
        usdcMint,
        workNft: derived.workNft,
        workerProfile: derived.workerProfile,
        scoreProgram: scoreProgram.programId,
        scoreState: derived.scoreState,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = client;
    return { transaction, instructions: [instruction], derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function executeCompleteJob(
  context: TxContext,
  request: CompleteJobRequest,
  options?: TxSendOptions
): Promise<TxExecuteResult<CompleteJobDerived>> {
  const built = await buildCompleteJobTx(context, request);
  try {
    const signature = await context.sendTransaction(built.transaction, context.connection, options);
    return { signature, derived: built.derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function buildClaimSkillTx(
  context: TxContext,
  request: ClaimSkillRequest
): Promise<TxBuildResult<ClaimSkillDerived>> {
  try {
    validateClaimSkillRequest(request);
    const worker = ensureWalletPublicKey(context.walletPublicKey);
    const provider = createReadOnlyProvider(context);
    const { coreProgram } = getPrograms(provider);
    const core = coreProgram as unknown as ProgramLike;

    const derived: ClaimSkillDerived = {
      workerProfile: deriveWorkerProfilePda(request.worker)
    };

    const instruction = await core.methods
      .claimSkill(request.skillTag, request.workSampleUrl)
      .accounts({
        worker,
        workerProfile: derived.workerProfile
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = worker;
    return { transaction, instructions: [instruction], derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function executeClaimSkill(
  context: TxContext,
  request: ClaimSkillRequest,
  options?: TxSendOptions
): Promise<TxExecuteResult<ClaimSkillDerived>> {
  const built = await buildClaimSkillTx(context, request);
  try {
    const signature = await context.sendTransaction(built.transaction, context.connection, options);
    return { signature, derived: built.derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function buildBorrowTx(
  context: TxContext,
  request: BorrowRequest
): Promise<TxBuildResult<BorrowDerived>> {
  try {
    validateBorrowRequest(request);
    const worker = ensureWalletPublicKey(context.walletPublicKey);
    const provider = createReadOnlyProvider(context);
    const { creditProgram, scoreProgram } = getPrograms(provider);
    const credit = creditProgram as unknown as ProgramLike;

    const derived: BorrowDerived = {
      creditLine: deriveCreditLinePda(request.lender, worker),
      lenderVault: deriveLenderVaultPda(request.lender, worker),
      loanPosition: deriveLoanPositionPda(request.lender, worker),
      scoreState: deriveScoreStatePda(worker)
    };
    const usdcMint = request.usdcMint ?? DEVNET_USDC_MINT;

    const remainingAccounts =
      request.includeScoreRecompute && request.workerProfileForRecompute
        ? [
            {
              pubkey: request.workerProfileForRecompute,
              isSigner: false,
              isWritable: false
            },
            ...((request.skillAttestationsForRecompute ?? []).map((pubkey) => ({
              pubkey,
              isSigner: false,
              isWritable: false
            })) as Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }>)
          ]
        : [];

    const method = credit.methods
      .borrow(toRawUsdc(request.amountUsdc))
      .accounts({
        worker,
        lender: request.lender,
        creditLine: derived.creditLine,
        lenderVault: derived.lenderVault,
        workerTokenAccount: request.workerTokenAccount,
        scoreState: derived.scoreState,
        loanPosition: derived.loanPosition,
        usdcMint,
        scoreProgram: scoreProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      });

    const instruction =
      remainingAccounts.length > 0
        ? await method.remainingAccounts(remainingAccounts).instruction()
        : await method.instruction();

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = worker;
    return { transaction, instructions: [instruction], derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function executeBorrow(
  context: TxContext,
  request: BorrowRequest,
  options?: TxSendOptions
): Promise<TxExecuteResult<BorrowDerived>> {
  const built = await buildBorrowTx(context, request);
  try {
    const signature = await context.sendTransaction(built.transaction, context.connection, options);
    return { signature, derived: built.derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function buildRepayTx(
  context: TxContext,
  request: RepayRequest
): Promise<TxBuildResult<RepayDerived>> {
  try {
    validateRepayRequest(request);
    const worker = ensureWalletPublicKey(context.walletPublicKey);
    const provider = createReadOnlyProvider(context);
    const { creditProgram } = getPrograms(provider);
    const credit = creditProgram as unknown as ProgramLike;

    const derived: RepayDerived = {
      creditLine: deriveCreditLinePda(request.lender, worker),
      lenderVault: deriveLenderVaultPda(request.lender, worker),
      loanPosition: deriveLoanPositionPda(request.lender, worker)
    };

    const instruction = await credit.methods
      .repay(toRawUsdc(request.amountUsdc))
      .accounts({
        worker,
        lender: request.lender,
        creditLine: derived.creditLine,
        lenderVault: derived.lenderVault,
        workerTokenAccount: request.workerTokenAccount,
        loanPosition: derived.loanPosition,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = worker;
    return { transaction, instructions: [instruction], derived };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function executeRepay(
  context: TxContext,
  request: RepayRequest,
  options?: TxSendOptions
): Promise<TxExecuteResult<RepayDerived>> {
  const built = await buildRepayTx(context, request);
  try {
    const signature = await context.sendTransaction(built.transaction, context.connection, options);
    return { signature, derived: built.derived };
  } catch (error) {
    throw normalizeError(error);
  }
}
