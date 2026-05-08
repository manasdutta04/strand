import Image from "next/image";
import Link from "next/link";
import { WhoDemoDialog } from "./WhoDemoDialog";

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-8 sm:px-6 lg:px-16 text-[#EFF4FF]">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-7">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Strand" width={20} height={20} className="rounded" style={{ width: "20px", height: "20px" }} />
            <p className="text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Strand</p>
          </div>
          <div className="mt-4 inline-flex items-center rounded-full border border-[#6FFF00]/20 bg-[#6FFF00]/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#6FFF00]">
            India gig workers • earnings PDFs • INR credit
          </div>
          <h1 className="strand-display mt-4 max-w-3xl text-3xl text-[#EFF4FF] sm:text-4xl">
            Portable reputation and credit for delivery riders and gig workers.
          </h1>
          <p className="mt-3 max-w-3xl font-mono text-sm sm:text-base text-[#EFF4FF]/75" style={{ color: "#EFF4FF" }}>
            Upload earnings PDFs from Zomato, Swiggy, Blinkit, Ola, or Uber. Strand turns them into WorkRecords,
            updates score, and unlocks credit in INR and USDC.
          </p>
        </header>

        <section className="rounded-[32px] border border-[#6FFF00]/20 bg-gradient-to-br from-[#6FFF00]/10 to-transparent p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00]">Demo mode</p>
              <h2 className="strand-display mt-3 text-2xl text-[#EFF4FF] sm:text-3xl">
                Open the product with a simulated worker profile.
              </h2>
              <p className="mt-3 max-w-2xl font-mono text-sm text-[#EFF4FF]/75">
                The demo shows the real SaaS flow: upload earnings PDFs, watch the score update, and see INR / USDC
                credit readiness. No seeded blockchain data required.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <WhoDemoDialog />
                <Link className="rounded-full border border-white/15 px-5 py-2 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:border-[#6FFF00] hover:text-[#6FFF00]" href="/login/worker">
                  Worker Workspace
                </Link>
                <Link className="rounded-full border border-white/15 px-5 py-2 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] transition-colors hover:border-[#6FFF00] hover:text-[#6FFF00]" href="/login/partner">
                  Partner Portal
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Input</p>
                  <p className="mt-2 font-mono text-sm font-medium text-[#EFF4FF]">PDF / screenshot upload</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Core</p>
                  <p className="mt-2 font-mono text-sm font-medium text-[#EFF4FF]">WorkRecords + score</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Output</p>
                  <p className="mt-2 font-mono text-sm font-medium text-[#EFF4FF]">INR and USDC credit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Market</p>
              <p className="mt-2 font-grotesk text-lg font-semibold text-[#EFF4FF]">12M+ Indian gig workers</p>
            </div>
            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Input</p>
              <p className="mt-2 font-grotesk text-lg font-semibold text-[#EFF4FF]">Earnings PDFs / screenshots</p>
            </div>
            <div>
              <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60">Output</p>
              <p className="mt-2 font-grotesk text-lg font-semibold text-[#EFF4FF]">Portable score + INR credit</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
