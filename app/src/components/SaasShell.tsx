"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StrandWalletButton } from "./WalletProvider";

interface NavItem {
  label: string;
  href: string;
}

interface SaasShellProps {
  productLabel: string;
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}

export function SaasShell({ productLabel, title, subtitle, nav, children }: SaasShellProps) {
  const pathname = usePathname();
  const isDemoRoute = pathname.startsWith("/worker/demo") || pathname.startsWith("/partner/demo");

  return (
    <main className="min-h-screen bg-[#010828] px-4 py-6 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Strand" width={16} height={16} className="rounded" style={{ width: "16px", height: "16px" }} />
              <span className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">{productLabel}</span>
            </div>
            <h1 className="font-grotesk text-2xl font-semibold tracking-tight text-[#EFF4FF] sm:text-3xl">{title}</h1>
            <p className="font-mono max-w-2xl text-sm text-[#EFF4FF]/75">{subtitle}</p>
          </div>
          {isDemoRoute ? (
            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-[#6FFF00]/20 bg-[#6FFF00]/5 px-3 text-sm font-medium text-[#EFF4FF]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
              >
                <path d="M3 6h6l2 4H5L3 6Z" fill="url(#solana-demo-gradient)" />
                <path d="M3 12h6l2 4H5l-2-4Z" fill="url(#solana-demo-gradient)" />
                <path d="M3 18h6l2-4H5l-2 4Z" fill="url(#solana-demo-gradient)" />
                <defs>
                  <linearGradient id="solana-demo-gradient" x1="3" y1="6" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#14F195" />
                    <stop offset="0.5" stopColor="#00C2FF" />
                    <stop offset="1" stopColor="#9945FF" />
                  </linearGradient>
                </defs>
              </svg>
              Demo wallet
            </div>
          ) : (
            <StrandWalletButton className="!h-10 !rounded-md !text-sm" />
          )}
        </header>

        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "rounded-lg px-4 py-2 font-grotesk text-xs uppercase tracking-[0.22em] bg-[#6FFF00] text-[#010828] font-medium transition-colors" : "rounded-lg px-4 py-2 font-grotesk text-xs uppercase tracking-[0.22em] border border-white/15 text-[#EFF4FF] transition-colors hover:border-[#6FFF00] hover:text-[#6FFF00]"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <section className="space-y-5">{children}</section>
      </div>
    </main>
  );
}
