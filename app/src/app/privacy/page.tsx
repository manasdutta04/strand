import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Privacy</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Privacy policy</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Last updated: May 8, 2026
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">What we collect</h2>
            <p>
              We collect wallet addresses, uploaded earnings proofs, score data, and basic usage data needed to run Strand.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">How we use it</h2>
            <p>
              We use this data to verify work, calculate score, show credit readiness, and operate worker and partner dashboards.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">On-chain data</h2>
            <p>
              Some records may be stored on Solana. On-chain data is public and cannot be deleted or modified by Strand.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Sharing</h2>
            <p>
              Partners may see score and work history when underwriting credit. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Security</h2>
            <p>
              We use standard security controls, but no system is perfectly secure. Keep your wallet safe and avoid sharing seed phrases.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Contact</h2>
            <p>
              Privacy questions? Email <code className="text-[#6FFF00]">privacy@strandprotocol.com</code>.
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
