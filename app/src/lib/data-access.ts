import { Connection, PublicKey } from "@solana/web3.js";
import {
  EXPLORER_TX,
  RPC_URL,
  STRAND_CORE_PROGRAM_ID,
  STRAND_CREDIT_PROGRAM_ID,
  STRAND_SCORE_PROGRAM_ID
} from "./constants";

const USDC_SCALE = 1_000_000;

const ACCOUNT_DISCRIMINATORS = {
  workerProfile: Uint8Array.from([40, 244, 208, 98, 69, 236, 70, 229]),
  workNft: Uint8Array.from([87, 30, 51, 227, 103, 92, 6, 91]),
  scoreState: Uint8Array.from([139, 15, 14, 224, 75, 162, 2, 213]),
  skillAttestation: Uint8Array.from([237, 9, 69, 131, 50, 162, 79, 14]),
  creditLine: Uint8Array.from([220, 226, 205, 24, 220, 151, 129, 104]),
  loanPosition: Uint8Array.from([45, 172, 28, 194, 82, 206, 243, 190])
};

export interface ChainWorkerProfile {
  worker: string;
  jobsDone: number;
  totalEarnedUsdc: number;
  uniqueClients: number;
  onTimeCompletions: number;
  memberSince: string;
}

export interface ChainScoreState {
  worker: string;
  score: number;
  version: number;
  computedAt: string;
}

export interface ChainWorkNft {
  client: string;
  amountUsdc: number;
  skills: string[];
  clientRating: number;
  completedAt: string;
  explorerUrl: string;
}

export interface ChainSkillAttestation {
  worker: string;
  name: string;
  confidence: number;
  evidenceHash: string;
  attestedAt: string;
}

export interface ChainCreditLineState {
  maxUsdc: number;
  apr: number;
  borrowedUsdc: number;
  hasCreditLine: boolean;
}

class AccountReader {
  private readonly view: DataView;
  private offset = 0;

  constructor(private readonly data: Uint8Array) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  expectDiscriminator(expected: Uint8Array): void {
    const actual = this.bytes(8);
    if (!bytesEqual(actual, expected)) {
      throw new Error("Unexpected account discriminator.");
    }
  }

  publicKey(): PublicKey {
    return new PublicKey(this.bytes(32));
  }

  u8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  bool(): boolean {
    return this.u8() !== 0;
  }

  u16(): number {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  u32(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  u64(): number {
    const value = Number(this.view.getBigUint64(this.offset, true));
    this.offset += 8;
    return value;
  }

  i64(): number {
    const value = Number(this.view.getBigInt64(this.offset, true));
    this.offset += 8;
    return value;
  }

  bytes(length: number): Uint8Array {
    const end = this.offset + length;
    if (end > this.data.byteLength) {
      throw new Error("Account data is shorter than expected.");
    }
    const value = this.data.slice(this.offset, end);
    this.offset = end;
    return value;
  }

  string(): string {
    const length = this.u32();
    return new TextDecoder().decode(this.bytes(length));
  }

  stringVec(): string[] {
    const count = this.u32();
    const values: string[] = [];
    for (let index = 0; index < count; index += 1) {
      values.push(this.string());
    }
    return values;
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

function toIsoFromUnix(unix: number): string {
  if (!Number.isFinite(unix) || unix <= 0) {
    return new Date(0).toISOString();
  }
  return new Date(unix * 1000).toISOString();
}

function usdcFromRaw(raw: number): number {
  return raw / USDC_SCALE;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function decodeWorkerProfile(data: Uint8Array): ChainWorkerProfile {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.workerProfile);
  const worker = reader.publicKey();
  const jobsDone = reader.u64();
  const totalEarnedRaw = reader.u64();
  const uniqueClients = reader.u32();
  const onTimeCompletions = reader.u64();
  reader.u64();
  const createdAt = reader.i64();

  return {
    worker: worker.toBase58(),
    jobsDone,
    totalEarnedUsdc: usdcFromRaw(totalEarnedRaw),
    uniqueClients,
    onTimeCompletions,
    memberSince: toIsoFromUnix(createdAt)
  };
}

function decodeScoreState(data: Uint8Array): ChainScoreState {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.scoreState);
  const worker = reader.publicKey();
  const score = reader.u16();
  const computedAt = reader.i64();
  const version = reader.u32();

  return {
    worker: worker.toBase58(),
    score,
    version,
    computedAt: toIsoFromUnix(computedAt)
  };
}

function decodeWorkNft(data: Uint8Array, accountKey: PublicKey): ChainWorkNft {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.workNft);
  reader.publicKey();
  const client = reader.publicKey();
  reader.u64();
  const amountRaw = reader.u64();
  reader.bytes(32);
  const skills = reader.stringVec().filter(Boolean);
  const clientRating = reader.u8();
  const completedAt = reader.i64();

  return {
    client: client.toBase58(),
    amountUsdc: usdcFromRaw(amountRaw),
    skills,
    clientRating,
    completedAt: toIsoFromUnix(completedAt),
    explorerUrl: `${EXPLORER_TX}/${accountKey.toBase58()}`
  };
}

function decodeSkillAttestation(data: Uint8Array): ChainSkillAttestation {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.skillAttestation);
  const worker = reader.publicKey();
  const name = reader.string();
  const confidence = reader.u8();
  const evidenceHash = reader.bytes(32);
  const attestedAt = reader.i64();

  return {
    worker: worker.toBase58(),
    name,
    confidence,
    evidenceHash: toHex(evidenceHash),
    attestedAt: toIsoFromUnix(attestedAt)
  };
}

function decodeCreditLine(data: Uint8Array): {
  worker: string;
  maxUsdc: number;
  annualRateBps: number;
  active: boolean;
} {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.creditLine);
  reader.publicKey();
  const worker = reader.publicKey();
  const maxUsdc = usdcFromRaw(reader.u64());
  const annualRateBps = reader.u16();
  reader.u16();
  const active = reader.bool();

  return {
    worker: worker.toBase58(),
    maxUsdc,
    annualRateBps,
    active
  };
}

function decodeLoanPosition(data: Uint8Array): {
  worker: string;
  principalUsdc: number;
} {
  const reader = new AccountReader(data);
  reader.expectDiscriminator(ACCOUNT_DISCRIMINATORS.loanPosition);
  reader.publicKey();
  const worker = reader.publicKey();
  const principalUsdc = usdcFromRaw(reader.u64());

  return {
    worker: worker.toBase58(),
    principalUsdc
  };
}

const connection = new Connection(RPC_URL, "confirmed");

export async function getWorkerProfile(walletAddress: string): Promise<ChainWorkerProfile | null> {
  const worker = new PublicKey(walletAddress);
  const [profilePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("profile"), worker.toBuffer()],
    STRAND_CORE_PROGRAM_ID
  );
  const account = await connection.getAccountInfo(profilePda);

  if (!account) {
    return null;
  }

  return decodeWorkerProfile(account.data);
}

export async function getScoreState(walletAddress: string): Promise<ChainScoreState | null> {
  const worker = new PublicKey(walletAddress);
  const [scorePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("score"), worker.toBuffer()],
    STRAND_SCORE_PROGRAM_ID
  );
  const account = await connection.getAccountInfo(scorePda);

  if (!account) {
    return null;
  }

  return decodeScoreState(account.data);
}

export async function listWorkNfts(walletAddress: string): Promise<ChainWorkNft[]> {
  const worker = new PublicKey(walletAddress);
  const accounts = await connection.getProgramAccounts(STRAND_CORE_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 8, bytes: worker.toBase58() } }]
  });

  const nfts: ChainWorkNft[] = [];
  for (const item of accounts) {
    try {
      nfts.push(decodeWorkNft(item.account.data, item.pubkey));
    } catch {
      // Account belongs to this worker but is not a WorkNFT.
    }
  }

  return nfts.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export async function listSkillAttestations(
  walletAddress: string
): Promise<ChainSkillAttestation[]> {
  const worker = new PublicKey(walletAddress);
  const accounts = await connection.getProgramAccounts(STRAND_SCORE_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 8, bytes: worker.toBase58() } }]
  });

  const skills: ChainSkillAttestation[] = [];
  for (const item of accounts) {
    try {
      skills.push(decodeSkillAttestation(item.account.data));
    } catch {
      // Account belongs to this worker but is not a SkillAttestation.
    }
  }

  return skills.sort(
    (a, b) => new Date(b.attestedAt).getTime() - new Date(a.attestedAt).getTime()
  );
}

export async function getCreditLineAndLoan(walletAddress: string): Promise<ChainCreditLineState> {
  const worker = new PublicKey(walletAddress);
  const accounts = await connection.getProgramAccounts(STRAND_CREDIT_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 40, bytes: worker.toBase58() } }]
  });

  let maxUsdc = 0;
  let apr = 0;
  let borrowedUsdc = 0;
  let hasCreditLine = false;

  for (const account of accounts) {
    try {
      const creditLine = decodeCreditLine(account.account.data);
      if (creditLine.worker !== walletAddress || !creditLine.active) {
        continue;
      }
      hasCreditLine = true;
      maxUsdc = Math.max(maxUsdc, creditLine.maxUsdc);
      apr = Math.max(apr, creditLine.annualRateBps / 100);
      continue;
    } catch {
      // Account may be a LoanPosition.
    }

    try {
      const loanPosition = decodeLoanPosition(account.account.data);
      if (loanPosition.worker === walletAddress) {
        borrowedUsdc += loanPosition.principalUsdc;
      }
    } catch {
      // Account belongs to this worker but is not part of the Day 1 credit read model.
    }
  }

  return {
    maxUsdc,
    apr,
    borrowedUsdc,
    hasCreditLine
  };
}
