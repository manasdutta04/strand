"use client";

import { ComponentType, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { clsx } from "clsx";
import { RPC_URL } from "../lib/constants";

import "@solana/wallet-adapter-react-ui/styles.css";

const TypedConnectionProvider = ConnectionProvider as unknown as ComponentType<{
  endpoint: string;
  children: ReactNode;
}>;
const TypedSolanaWalletProvider = SolanaWalletProvider as unknown as ComponentType<{
  wallets: never[];
  autoConnect?: boolean;
  children: ReactNode;
}>;
const TypedWalletModalProvider = WalletModalProvider as unknown as ComponentType<{
  children: ReactNode;
}>;

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [], []);

  return (
    <TypedConnectionProvider endpoint={RPC_URL}>
      <TypedSolanaWalletProvider wallets={wallets} autoConnect>
        <TypedWalletModalProvider>{children}</TypedWalletModalProvider>
      </TypedSolanaWalletProvider>
    </TypedConnectionProvider>
  );
}

export function StrandWalletButton({ className }: { className?: string }) {
  return <WalletMultiButton className={clsx(className)} />;
}
