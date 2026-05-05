"use client";

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

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{productLabel}</div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <StrandWalletButton className="!h-10 !rounded-md !text-sm" />
        </header>

        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "btn-accent" : "btn-subtle"}
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
