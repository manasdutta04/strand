import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import coreIdl from "./idl/strand_core.json";
import scoreIdl from "./idl/strand_score.json";
import creditIdl from "./idl/strand_credit.json";
import {
  STRAND_CORE_PROGRAM_ID,
  STRAND_CREDIT_PROGRAM_ID,
  STRAND_SCORE_PROGRAM_ID
} from "./constants";

function withProgramAddress(idl: unknown, address: PublicKey): Idl {
  return {
    ...(idl as object),
    address: address.toBase58()
  } as unknown as Idl;
}

export function getPrograms(provider: AnchorProvider) {
  const core = withProgramAddress(coreIdl, STRAND_CORE_PROGRAM_ID);
  const score = withProgramAddress(scoreIdl, STRAND_SCORE_PROGRAM_ID);
  const credit = withProgramAddress(creditIdl, STRAND_CREDIT_PROGRAM_ID);

  return {
    coreProgram: new Program(core, provider),
    scoreProgram: new Program(score, provider),
    creditProgram: new Program(credit, provider)
  };
}
