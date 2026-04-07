import { PublicKey } from "@solana/web3.js";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";

export const STRAND_CORE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STRAND_CORE_PROGRAM_ID ??
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const STRAND_SCORE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STRAND_SCORE_PROGRAM_ID ??
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const STRAND_CREDIT_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STRAND_CREDIT_PROGRAM_ID ??
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const DEVNET_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ?? "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

export const EXPLORER_TX = "https://solana.fm/tx";
