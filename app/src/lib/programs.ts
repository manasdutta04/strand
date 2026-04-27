import { AnchorProvider, Program } from "@coral-xyz/anchor";
import coreIdl from "./idl/strand_core.json";
import scoreIdl from "./idl/strand_score.json";
import creditIdl from "./idl/strand_credit.json";
import {
  STRAND_CORE_PROGRAM_ID,
  STRAND_CREDIT_PROGRAM_ID,
  STRAND_SCORE_PROGRAM_ID
} from "./constants";

export function getPrograms(provider: AnchorProvider) {
  const core = {
    ...(coreIdl as any),
    address: STRAND_CORE_PROGRAM_ID.toBase58()
  };
  const score = {
    ...(scoreIdl as any),
    address: STRAND_SCORE_PROGRAM_ID.toBase58()
  };
  const credit = {
    ...(creditIdl as any),
    address: STRAND_CREDIT_PROGRAM_ID.toBase58()
  };

  return {
    coreProgram: new Program(core as any, provider as any),
    scoreProgram: new Program(score as any, provider as any),
    creditProgram: new Program(credit as any, provider as any)
  };
}
