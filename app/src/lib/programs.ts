import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import coreIdl from "@/lib/idl/strand_core.json";
import scoreIdl from "@/lib/idl/strand_score.json";
import creditIdl from "@/lib/idl/strand_credit.json";
import {
  STRAND_CORE_PROGRAM_ID,
  STRAND_CREDIT_PROGRAM_ID,
  STRAND_SCORE_PROGRAM_ID
} from "@/lib/constants";

export function getPrograms(provider: AnchorProvider) {
  return {
    coreProgram: new Program(coreIdl as Idl, STRAND_CORE_PROGRAM_ID, provider),
    scoreProgram: new Program(scoreIdl as Idl, STRAND_SCORE_PROGRAM_ID, provider),
    creditProgram: new Program(creditIdl as Idl, STRAND_CREDIT_PROGRAM_ID, provider)
  };
}
