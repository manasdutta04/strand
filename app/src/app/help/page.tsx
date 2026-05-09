import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Help</p>
        <h1 className="strand-display mt-6 text-4xl sm:text-5xl" style={{ color: "#EFF4FF" }}>Help center</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Short answers for workers and partners.
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-6" style={{ color: "#EFF4FF" }}>Getting started</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I begin?</h3>
                <p className="ml-4">A: Open Strand, connect a wallet, and add your first earnings proof.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Can I try it first?</h3>
                <p className="ml-4">A: Yes. Open workspace selection, pick Worker or Partner, and connect a wallet to start.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-6" style={{ color: "#EFF4FF" }}>Worker questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What can I upload?</h3>
                <p className="ml-4">A: Add a manual work record with platform, work date, earnings (INR), and trips/orders.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What changes after upload?</h3>
                <p className="ml-4">A: Your work history updates, score recalculates, and credit readiness becomes visible.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-6" style={{ color: "#EFF4FF" }}>Partner questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What do partners see?</h3>
                <p className="ml-4">A: Worker score, verified work history, and the underwriting queue.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I review credit requests?</h3>
                <p className="ml-4">A: Open the partner dashboard and use the queue to approve or decline requests.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="strand-display text-lg sm:text-xl text-[#EFF4FF] mb-6" style={{ color: "#EFF4FF" }}>Need support?</h2>
            <p>
              Email <code className="text-[#6FFF00]">support@strandprotocol.com</code> or open a GitHub issue.
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
