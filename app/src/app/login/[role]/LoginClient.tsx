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
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">Role Access</p>
        <h1 className="mt-2 text-3xl font-semibold">{roleMeta.label} Workspace</h1>
        <p className="mt-3 text-sm text-muted">{roleMeta.description}</p>

        <div className="mt-6 rounded-lg border border-border bg-[#141414] p-4 text-sm text-muted">
          Wallet access is used for signature-based identity and transaction approvals.
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn-accent" onClick={continueWithWallet} type="button">
            Connect Wallet And Enter
          </button>
          <Link className="btn-subtle" href="/">
            Back To Role Selection
          </Link>
        </div>
      </section>
    </main>
  );
}
