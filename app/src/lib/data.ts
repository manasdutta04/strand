import { PublicKey } from "@solana/web3.js";
import { getPrograms } from "./programs";
import { AnchorProvider } from "@coral-xyz/anchor";

// Types based on program accounts
export interface WorkerProfile {
  jobsDone: number;
  totalEarnedUsdc: number;
  uniqueClients: number;
  onTimeCompletions: number;
  memberSince: string;
}

export interface ScoreState {
  score: number;
  // Add other fields as per IDL
}

export interface WorkNFT {
  client: string;
  completedAt: string;
  amountUsdc: number;
  skills: string[];
}

export interface CreditLine {
  maxUsdc: number;
  borrowedUsdc: number;
  apr: number;
}

export interface SkillAttestation {
  name: string;
  confidence: number;
}

// Provider setup - assume wallet adapter provides provider
// For now, placeholder
async function getProvider(): Promise<AnchorProvider> {
  // TODO: get from wallet adapter
  throw new Error("Provider not implemented");
}

export async function getWorkerProfile(wallet: PublicKey): Promise<WorkerProfile | null> {
  const provider = await getProvider();
  const { coreProgram } = getPrograms(provider);
  try {
    const account = await coreProgram.account.workerProfile.fetchNullable(wallet);
    if (!account) return null;
    // Map account to WorkerProfile
    return {
      jobsDone: account.jobsDone || 0,
      totalEarnedUsdc: account.totalEarnedUsdc || 0,
      uniqueClients: account.uniqueClients || 0,
      onTimeCompletions: account.onTimeCompletions || 0,
      memberSince: account.memberSince || new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to fetch worker profile:", error);
    return null;
  }
}

export async function getScoreState(wallet: PublicKey): Promise<ScoreState | null> {
  const provider = await getProvider();
  const { scoreProgram } = getPrograms(provider);
  try {
    const [scoreStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("score"), wallet.toBuffer()],
      scoreProgram.programId
    );
    const account = await scoreProgram.account.scoreState.fetchNullable(scoreStatePda);
    if (!account) return null;
    return {
      score: account.score || 0
    };
  } catch (error) {
    console.error("Failed to fetch score state:", error);
    return null;
  }
}

export async function getWorkNFTs(wallet: PublicKey): Promise<WorkNFT[]> {
  // TODO: Implement fetching all work NFTs for the worker
  // This might require indexing or multiple fetches
  // For now, return empty
  return [];
}

export async function getCreditLine(wallet: PublicKey): Promise<CreditLine | null> {
  // TODO: Implement
  return null;
}

export async function getSkills(wallet: PublicKey): Promise<SkillAttestation[]> {
  // TODO: Implement fetching attested skills
  return [];
}