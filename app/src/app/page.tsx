"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center rounded-full p-2 liquid-glass"
      >
        <svg className="w-6 h-6 text-[#EFF4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open ? (
        typeof document !== "undefined"
          ? createPortal(
              <div className="fixed inset-0 z-[99999] flex" role="dialog" aria-modal="true">
                <div className="absolute inset-0 bg-black/60 z-[99998]" onClick={() => setOpen(false)} />
                <div className="ml-auto w-72 max-w-[80%] bg-[#010828] p-6 z-[99999] pointer-events-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/logo.svg" alt="Strand" className="h-8 w-auto" />
                      <span className="font-grotesk text-[16px] uppercase text-[#EFF4FF]">Strand</span>
                    </div>
                    <button onClick={() => setOpen(false)} className="liquid-glass rounded-full px-2 py-1">
                      Close
                    </button>
                  </div>

                  <nav className="mt-6 flex flex-col gap-4">
                    <a href="#product" onClick={() => setOpen(false)} className="font-grotesk uppercase text-[#EFF4FF]">Features</a>
                    <a href="#pricing" onClick={() => setOpen(false)} className="font-grotesk uppercase text-[#EFF4FF]">Pricing</a>
                    <a href="/docs" onClick={() => setOpen(false)} className="font-grotesk uppercase text-[#EFF4FF]">Docs</a>
                    <a href="/help" onClick={() => setOpen(false)} className="font-grotesk uppercase text-[#EFF4FF]">Help</a>
                    <a href="https://github.com/manasdutta04/strand" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="font-grotesk uppercase text-[#EFF4FF]">GitHub</a>

                    <Link href="/who" onClick={() => setOpen(false)} className="mt-4 liquid-glass rounded-full px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF]">
                      Get Started
                    </Link>
                  </nav>
                </div>
              </div>,
              document.body
            )
          : null
      ) : null}
    </>
  );
}

function MobileMenu() {
  return null;
}

const featureCards = [
  {
    title: "Work history",
    description: "Verified proof of completed work that travels with the wallet.",
    eyebrow: "Verified"
  },
  {
    title: "Strand Score",
    description: "A live score built from earnings, consistency, and attestations.",
    eyebrow: "0 - 1000"
  },
  {
    title: "Credit access",
    description: "Partners underwrite from on-chain reputation and issue USDC credit.",
    eyebrow: "USDC-ready"
  }
] as const;

const signalCards = [
  {
    title: "Worker workspace",
    description: "Track earnings, skills, and score in one workspace."
  },
  {
    title: "Partner workflow",
    description: "Review verified work and manage credit lines."
  },
  {
    title: "Verified proof",
    description: "All work history and scores live on-chain for instant access."
  }
] as const;

const trustedUsers = [
  { name: "Zomato", src: "/brands/zomato.svg", width: 144, height: 44 },
  { name: "Swiggy", src: "/brands/swiggy.svg", width: 154, height: 48 },
  { name: "Blinkit", src: "/brands/blinkit.svg", width: 182, height: 48 },
  { name: "Ola", src: "/brands/ola.svg", width: 145, height: 55 },
  { name: "Uber", src: "/brands/uber.svg", width: 156, height: 52 },
  { name: "Urban Company", src: "/brands/uclub.png", width: 180, height: 54 }
] as const;

const pricingPlans = [
  {
    name: "Free",
    price: "Own key",
    description: "Bring your own key and start with the core proof flow.",
    cta: "Start free",
    featured: false
  },
  {
    name: "Pro",
    price: "$9/month",
    description: "Key provided. Coming soon for teams that want managed access.",
    cta: "Coming soon",
    featured: true
  }
] as const;

export default function StrandLandingPage() {
  return (
    <main className="bg-[#010828] overflow-hidden scroll-smooth">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3CfeColorMatrix in='noise' type='saturate' values='0' /%3E%3C/filter%3E%3Crect width='400' height='400' fill='%23ffffff' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          mixBlendMode: "lighten",
          opacity: 0.6
        }}
      />

      <section id="home" className="relative min-h-screen overflow-hidden rounded-b-[32px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
        />
        <div className="absolute inset-0 bg-black/35" />

        <header className="relative z-10 mx-auto flex max-w-[1831px] items-center justify-between px-4 py-6 sm:px-6 lg:px-16 lg:py-8">
          <a href="#home" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Strand" className="h-8 sm:h-10 w-auto" />
            <span className="ml-2 font-grotesk text-[20px] uppercase text-white tracking-[0.03em] sm:text-[22px] md:text-[24px]">
              Strand
            </span>
          </a>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <MobileMenuButton />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <div className="rounded-[28px] px-6 py-3 liquid-glass flex items-center">
              {[
                ["Features", "#product"],
                ["Pricing", "#pricing"],
                ["Docs", "/docs"],
                ["Help", "/help"],
                ["GitHub", "https://github.com/manasdutta04/strand"]
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="mx-3 font-grotesk text-xs uppercase tracking-[0.18em] text-[#EFF4FF] transition-colors hover:text-[#6FFF00]"
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {label}
                </a>
              ))}
            </div>

          
          </nav>
          
          {/* Mobile menu panel (renders into the page root when open) */}
          <MobileMenu />
        </header>

        <div className="relative z-10 mx-auto max-w-[1831px] px-4 pb-16 pt-14 sm:px-6 lg:px-16 lg:pb-20 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="relative max-w-4xl lg:ml-28">
              <p className="mb-6 font-grotesk text-[11px] uppercase tracking-[0.35em] text-[#6FFF00] sm:text-xs">
                Built on Solana • worker and partner credit
              </p>

              <h1 className="max-w-4xl font-grotesk text-[42px] uppercase leading-[1.05] text-[#EFF4FF] sm:text-[60px] md:text-[75px] lg:text-[90px] lg:leading-[1]">
                Work,
                <br />
                score,
                <br/>
                credit
                <br/>
                <span className="font-condiment normal-case text-[#6FFF00]">for India</span>
              </h1>

              <div className="mt-8 flex items-center">
                <Link href="/who" className="liquid-glass rounded-full px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:text-[#6FFF00]">
                  Get Started
                </Link>
              </div>
              

            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[#010828] py-5">
        <div className="mx-auto max-w-[1831px] px-4 sm:px-6 lg:px-16">
          <p className="text-center font-grotesk text-[11px] uppercase tracking-[0.3em] text-[#6FFF00] sm:text-xs">
            Built for People of
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:gap-4">
            {trustedUsers.map((brand) => (
              <div key={brand.name} className="flex items-center justify-center px-2 py-1">
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={brand.width}
                  height={brand.height}
                  className="h-6 sm:h-7 md:h-8 w-auto select-none object-contain opacity-95"
                  draggable={false}
                  priority={brand.name === "Zomato"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="relative w-full min-h-screen overflow-hidden rounded-b-[32px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto max-w-[1831px] px-4 py-16 sm:px-6 lg:px-16 lg:py-24">
          <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-end">
            <div className="relative">
              <h2 className="font-grotesk text-[36px] uppercase leading-[1.1] text-[#EFF4FF] sm:text-[48px] md:text-[58px] lg:text-[60px]">
                Core
                <br />
                Features
              </h2>

              <div className="absolute bottom-4 right-0 font-condiment text-[42px] text-[#6FFF00] opacity-90 sm:text-[58px] md:text-[68px]" style={{ mixBlendMode: "exclusion" }}>
                product layer
              </div>
            </div>

            <p className="max-w-md font-mono text-[14px] uppercase leading-relaxed text-[#EFF4FF] sm:text-[16px] lg:justify-self-end">
              One SaaS workspace for workers and partners on Solana. Everyone reads the same verified work history, score, and credit signal.
            </p>
          </div>

        </div>
      </section>

      <section id="proof" className="w-full bg-[#010828] py-24">
        <div className="mx-auto max-w-[1831px] px-4 sm:px-6 lg:px-16">
          <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <h2 className="mb-4 font-grotesk text-[36px] uppercase leading-[1.1] text-[#EFF4FF] sm:text-[48px] md:text-[58px] lg:text-[60px]">
                How it
              </h2>
              <h2 className="ml-12 font-grotesk text-[36px] uppercase leading-[1.1] text-[#EFF4FF] sm:ml-24 sm:text-[48px] md:ml-32 md:text-[58px] lg:text-[60px]">
                <span className="font-condiment normal-case text-[#6FFF00]">works</span>
              </h2>
            </div>

            <p className="max-w-md font-mono text-[14px] uppercase leading-relaxed text-[#EFF4FF]/80 sm:text-[16px] lg:justify-self-end">
              A product-first flow built around proof, score, and credit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article key={card.title} className="liquid-glass rounded-[32px] p-[18px] transition-colors hover:bg-white/10">
                <div className="relative min-h-[320px] overflow-hidden rounded-[24px] border border-white/5 bg-white/5 p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,255,0,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(183,36,255,0.12),transparent_45%)]" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <p className="font-grotesk text-xs uppercase tracking-[0.22em] text-[#6FFF00]">{card.eyebrow}</p>
                      <h3 className="mt-4 font-grotesk text-[28px] uppercase leading-[1.05] text-[#EFF4FF] sm:text-[34px]">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-8 font-mono text-[14px] uppercase leading-relaxed text-[#EFF4FF]">
                      {card.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-white/10 bg-[#010828] py-24">
        <div className="mx-auto max-w-[1831px] px-4 sm:px-6 lg:px-16">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Pricing</p>
              <h2 className="max-w-2xl font-grotesk text-[36px] uppercase leading-[1.08] text-[#EFF4FF] sm:text-[48px] md:text-[58px] lg:text-[60px]">
                Simple plans for individuals and teams.
              </h2>
            </div>

            <p className="max-w-md font-mono text-[14px] uppercase leading-relaxed text-[#EFF4FF]/80 sm:text-[16px] lg:text-right">
              Free starts with your own key. Pro is key-provided and is coming soon at $9 per month.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[32px] border p-[18px] ${plan.featured ? "border-[#6FFF00]/40 bg-white/10" : "border-white/10 bg-white/5"}`}
              >
                <div className="liquid-glass h-full rounded-[24px] p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-grotesk text-xs uppercase tracking-[0.24em] text-[#6FFF00]">{plan.name}</p>
                      <h3 className="mt-4 font-grotesk text-[34px] uppercase leading-none text-[#EFF4FF] sm:text-[42px]">
                        {plan.price}
                      </h3>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full border border-[#6FFF00]/30 bg-[#6FFF00]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6FFF00]">
                        Coming soon
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-6 max-w-md font-mono text-[14px] uppercase leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
                    {plan.description}
                  </p>

                  <div className="mt-8 flex items-center gap-4">
                    <Link href="/who" className="liquid-glass rounded-full px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:text-[#6FFF00]">
                      {plan.cta}
                    </Link>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#EFF4FF]/55">
                      {plan.featured ? "Key provided" : "Bring your own key"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="relative w-full overflow-hidden py-24 min-h-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-auto w-full block"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto max-w-[1831px] px-4 sm:px-6 lg:px-16 lg:pr-[20%]">
          <div className="font-condiment mb-6 text-[20px] text-[#6FFF00] opacity-90 sm:text-[32px] md:text-[48px] lg:text-[68px]" style={{ mixBlendMode: "exclusion" }}>
            The stack
          </div>

          <h2 className="max-w-2xl font-grotesk text-[18px] uppercase leading-[1.1] text-[#EFF4FF] sm:text-[32px] md:text-[48px] lg:text-[60px]">
            <span className="block mb-4 lg:mb-8">Work NFTs.</span>
            <span className="block">Score.</span>
            <span className="block">Skills.</span>
            <span className="block">Credit.</span>
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {signalCards.map((card) => (
              <article key={card.title} className="liquid-glass rounded-[24px] p-5">
                <p className="font-grotesk text-xs uppercase tracking-[0.24em] text-[#6FFF00]">{card.title}</p>
                <p className="mt-3 font-mono text-sm uppercase leading-relaxed text-[#EFF4FF]/80">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10 bg-[#050b20] py-16">
        <div className="mx-auto max-w-[1831px] px-4 sm:px-6 lg:px-16">
          <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Strand" className="h-10 w-auto" />
                <span className="font-grotesk text-[18px] uppercase tracking-[0.08em] text-[#EFF4FF]">Strand</span>
              </div>
              <p className="mt-6 max-w-sm font-mono text-[14px] leading-relaxed text-[#EFF4FF]/65">
                Strand turns verified work into a simple score and credit signal for workers and partners.
              </p>
              
            </div>

            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.28em] text-[#EFF4FF]">Product</p>
              <div className="mt-5 space-y-4 font-mono text-[14px] text-[#EFF4FF]/60">
                <a href="#product" className="block transition-colors hover:text-[#EFF4FF]">Features</a>
                <a href="#pricing" className="block transition-colors hover:text-[#EFF4FF]">Pricing</a>
                <a href="#stack" className="block transition-colors hover:text-[#EFF4FF]">Stack</a>
              </div>
            </div>

            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.28em] text-[#EFF4FF]">Resources</p>
              <div className="mt-5 space-y-4 font-mono text-[14px] text-[#EFF4FF]/60">
                <a href="/docs" className="block transition-colors hover:text-[#EFF4FF]">Docs</a>
                <a href="/help" className="block transition-colors hover:text-[#EFF4FF]">Help</a>
                <a href="https://github.com/manasdutta04/strand#creators" className="block transition-colors hover:text-[#EFF4FF]">Creators</a>
              </div>
            </div>

            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.28em] text-[#EFF4FF]">Legal</p>
              <div className="mt-5 space-y-4 font-mono text-[14px] text-[#EFF4FF]/60">
                <a href="/privacy" className="block transition-colors hover:text-[#EFF4FF]">Privacy</a>
                <a href="/terms" className="block transition-colors hover:text-[#EFF4FF]">Terms</a>
                <a href="https://github.com/manasdutta04/strand" target="_blank" rel="noopener noreferrer" className="block transition-colors hover:text-[#EFF4FF]">GitHub</a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-sm text-[#EFF4FF]/55">Strand © 2026 • Apache Licensed • Solana-based</p>
            <div className="flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.18em] text-[#EFF4FF]/55">
              <span>Build For India</span>
              <span>By Indians ❤️</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
