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
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 bg-[#010828] text-[#EFF4FF] sm:px-6">
      <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm w-full p-6 sm:p-8">
        <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Workspace access</p>
        <h1 className="mt-3 font-grotesk text-3xl font-semibold tracking-tight text-[#EFF4FF]">{roleMeta.label} portal</h1>
        <p className="mt-3 font-mono text-sm text-[#EFF4FF]/75">{roleMeta.description}</p>

        <div className="mt-6 rounded-lg border border-[#6FFF00]/20 bg-[#6FFF00]/5 p-4 font-mono text-sm text-[#EFF4FF]/75">
          Wallet access is used for signature-based identity and transaction approvals. For the product demo, use
          demo mode from the access screen.
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="rounded-full border border-[#6FFF00] px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] bg-[#6FFF00]/10 transition-colors hover:bg-[#6FFF00]/20" onClick={continueWithWallet} type="button">
            Connect wallet and enter
          </button>
          <Link className="rounded-full border border-white/15 px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:border-[#6FFF00] hover:text-[#6FFF00]" href="/">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
