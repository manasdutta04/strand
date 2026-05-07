"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ROLE_META, UserRole } from "../../../lib/roles";

export default function LoginClient({ role }: { role: UserRole }) {
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const roleMeta = ROLE_META[role];

  useEffect(() => {
    if (!connected) {
      return;
    }
    localStorage.setItem("strand-active-role", role);
    router.replace(roleMeta.dashboardPath);
  }, [connected, role, roleMeta.dashboardPath, router]);

  function continueWithWallet(): void {
    localStorage.setItem("strand-active-role", role);
    if (!connected) {
      setVisible(true);
      return;
    }
    router.push(roleMeta.dashboardPath);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 sm:px-6">
      <section className="panel w-full p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{roleMeta.label} portal</h1>
        <p className="mt-3 text-sm text-muted-foreground">{roleMeta.description}</p>

        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Wallet access is used for signature-based identity and transaction approvals. For the product demo, use
          demo mode from the access screen.
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn-accent" onClick={continueWithWallet} type="button">
            Connect wallet and enter
          </button>
          <Link className="btn-subtle" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
