// @ts-nocheck
"use client";

import { ReactNode, useMemo } from "react";
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

export function WalletProvider({ children }: { children: any }): any {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      {(
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children as any}</WalletModalProvider>
        </SolanaWalletProvider>
      ) as any}
    </ConnectionProvider>
  );
}

export function StrandWalletButton({ className }: { className?: string }) {
  return <WalletMultiButton className={clsx(className)} />;
}
