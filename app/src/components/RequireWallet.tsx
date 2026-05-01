"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function RequireWallet({
  children,
  redirectTo
}: {
  children: React.ReactNode;
  redirectTo: string;
}) {
  const router = useRouter();
  const { connected, connecting } = useWallet();

  useEffect(() => {
    if (!connecting && !connected) {
      router.replace(redirectTo);
    }
  }, [connected, connecting, redirectTo, router]);

  if (!connected) {
    return null;
  }

  return <>{children}</>;
}
