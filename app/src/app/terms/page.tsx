import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Terms</p>
        <h1 className="strand-display mt-6 text-4xl sm:text-5xl" style={{ color: "#EFF4FF" }}>Terms of service</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Last updated: May 8, 2026
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Use of Strand</h2>
            <p>
              Strand provides a worker reputation and partner credit workspace built on Solana. By using the app,
              you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Wallets and accounts</h2>
            <p>
              You are responsible for your wallet and any activity under it. We do not store private keys or seed phrases.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Work records</h2>
            <p>
              Work records, scores, and attestations may be stored on-chain and cannot be edited after verification.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>Credit</h2>
            <p>
              Credit is issued by partners, not Strand. Terms, rates, and repayment rules are set by the partner.
            </p>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-4" style={{ color: "#EFF4FF" }}>No guarantees</h2>
            <p>
              Strand is provided as-is. We do not guarantee credit approval, score outcomes, or uninterrupted service.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Contact</h2>
            <p>
              Questions about these terms? Email <code className="text-[#6FFF00]">support@strandprotocol.com</code>.
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
