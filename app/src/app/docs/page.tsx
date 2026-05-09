import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Docs</p>
        <h1 className="strand-display mt-6 text-4xl sm:text-5xl" style={{ color: "#EFF4FF" }}>Product guide</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Strand turns earnings proofs into a worker score and partner-ready credit signal.
        </p>

        <div className="mt-12 space-y-10 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Overview</h2>
            <p>
              Workers add verified work records. Strand stores each record in Supabase, updates score components, and shows credit readiness.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Worker flow</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Add work records for Zomato, Swiggy, Blinkit, Ola, Uber, or Urban Company</li>
              <li>Track work history, skills, and score in the worker dashboard</li>
              <li>All worker pages read live non-demo data from the same backend record set</li>
            </ul>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Partner flow</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Review worker score and verified work history</li>
              <li>Open or adjust credit from the partner dashboard</li>
              <li>Use the underwriting queue to review requests quickly</li>
            </ul>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Core modules</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Work history and score generation</li>
              <li>Oracle-backed verification</li>
              <li>Credit line management</li>
            </ul>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Need a quick start?</h2>
            <p>
              Open <Link href="/who" className="text-[#6FFF00] hover:underline">workspace selection</Link>, choose Worker or Partner, then connect your wallet.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>BYOK Cloud Setup (Supabase)</h2>
            <ul className="ml-4 list-disc space-y-2">
              <li>Open <Link href="/settings" className="text-[#6FFF00] hover:underline">Settings</Link> and connect your wallet.</li>
              <li>Choose `provider`, `api key`, `base URL`, and `model`.</li>
              <li>Use <strong>Save Cloud</strong> to store per-wallet config in Supabase via signed wallet auth.</li>
              <li>Use <strong>Load Cloud</strong> to restore config on any device after connecting the same wallet.</li>
              <li>Wallet connection is enough for this flow. No extra email/password sign-in is required.</li>
            </ul>
          </section>
        </div>

        <Link href="/" className="mt-12 inline-flex rounded-full border border-white/15 px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] hover:border-[#6FFF00] hover:text-[#6FFF00] transition-colors">
          Back home
        </Link>
      </div>
    </main>
  );
}
