import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Docs</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Product guide</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Strand turns earnings proofs into a worker score and partner-ready credit signal.
        </p>

        <div className="mt-12 space-y-10 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Overview</h2>
            <p>
              Workers upload earnings PDFs or screenshots. Strand reads the proof, updates score, and shows credit readiness.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Worker flow</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Add earnings from Zomato, Swiggy, Blinkit, Ola, Uber, or Urban Company</li>
              <li>Track work history, skills, and score in the worker dashboard</li>
              <li>Use the demo routes to preview the full experience without a wallet</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Partner flow</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Review worker score and verified work history</li>
              <li>Open or adjust credit from the partner dashboard</li>
              <li>Use the underwriting queue to review requests quickly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Core modules</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Work history and score generation</li>
              <li>Oracle-backed verification</li>
              <li>Credit line management</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Need a quick start?</h2>
            <p>
              Open <Link href="/who" className="text-[#6FFF00] hover:underline">demo mode</Link> to see the full product without connecting a wallet.
            </p>
          </section>
        </div>

        <Link href="/" className="mt-12 inline-flex rounded-full border border-white/15 px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] hover:border-[#6FFF00] hover:text-[#6FFF00] transition-colors">
          Back home
        </Link>
      </div>
    </main>
  );
}
