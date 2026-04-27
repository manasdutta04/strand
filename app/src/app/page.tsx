"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { JobFlow } from "../components/JobFlow";

const FEATURES = [
  {
    icon: "◈",
    title: "Portable reputation",
    description: "On-chain work history you own forever"
  },
  {
    icon: "◎",
    title: "AI-verified skills",
    description: "Local AI validates your work samples, no data leaves your machine"
  },
  {
    icon: "↗",
    title: "Instant credit",
    description: "Your reputation score unlocks USDC credit lines"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  function onPrimaryAction(): void {
    if (!connected) {
      setVisible(true);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center animate-fade-rise">
          <p className="mb-4 rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-accent">
            Solana Frontier Hackathon 2026
          </p>
          <h1 className="mb-5 text-5xl font-semibold leading-tight text-primary sm:text-6xl">
            Your wallet is your résumé.
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-muted sm:text-xl">
            Prove your work. Build your score. Access credit.
          </p>
          <button className="btn-accent px-7 py-3 text-base" onClick={onPrimaryAction}>
            Connect Wallet
          </button>
        </div>

        <div className="relative mt-16 grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className="panel p-5 opacity-0"
              style={{
                animation: "fade-rise 500ms ease-out forwards",
                animationDelay: `${120 + index * 110}ms`
              }}
            >
              <div className="mb-3 text-2xl text-accent">{feature.icon}</div>
              <h2 className="mb-2 text-xl font-semibold">{feature.title}</h2>
              <p className="text-sm text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <JobFlow />
    </main>
  );
}
