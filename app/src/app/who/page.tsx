import Image from "next/image";
import Link from "next/link";
import { WhoDemoDialog } from "./WhoDemoDialog";

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="panel px-6 py-7">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Strand" width={20} height={20} className="rounded" style={{ width: "20px", height: "20px" }} />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Strand</p>
          </div>
          <div className="mt-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
            India gig workers • earnings PDFs • INR credit
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Portable reputation and credit for delivery riders and gig workers.
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-muted-foreground">
            Upload earnings PDFs from Zomato, Swiggy, Blinkit, Ola, or Uber. Strand turns them into WorkRecords,
            updates score, and unlocks credit in INR and USDC.
          </p>
        </header>

        <section className="panel border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo mode</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Open the product with a simulated worker profile.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                The demo shows the real SaaS flow: upload earnings PDFs, watch the score update, and see INR / USDC
                credit readiness. No seeded blockchain data required.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <WhoDemoDialog />
                <Link className="btn-subtle" href="/login/worker">
                  Worker Workspace
                </Link>
                <Link className="btn-subtle" href="/login/partner">
                  Partner Portal
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Input</p>
                  <p className="mt-2 text-sm font-medium">PDF / screenshot upload</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Core</p>
                  <p className="mt-2 text-sm font-medium">WorkRecords + score</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Output</p>
                  <p className="mt-2 text-sm font-medium">INR and USDC credit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel px-6 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Market</p>
              <p className="mt-2 text-lg font-semibold">12M+ Indian gig workers</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Input</p>
              <p className="mt-2 text-lg font-semibold">Earnings PDFs / screenshots</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Output</p>
              <p className="mt-2 text-lg font-semibold">Portable score + INR credit</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
