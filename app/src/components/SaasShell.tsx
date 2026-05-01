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
    <main className="min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted">{productLabel}</div>
            <h1 className="mt-1 text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          <StrandWalletButton className="!h-10 !text-sm" />
        </header>

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="panel h-fit p-3">
            <nav className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "block rounded-lg bg-accent px-3 py-2 text-sm font-medium text-primary"
                        : "block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-card-hover hover:text-primary"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="space-y-5">{children}</section>
        </div>
      </div>
    </main>
  );
}
