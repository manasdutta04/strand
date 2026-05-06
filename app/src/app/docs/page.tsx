import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Documentation</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Developer & User Guide</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Complete documentation for using Strand, integrating with the protocol, and understanding on-chain proof mechanisms.
        </p>

        <nav className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            { title: "Getting Started", href: "#getting-started" },
            { title: "Wallet Setup", href: "#wallet-setup" },
            { title: "Work NFTs", href: "#work-nfts" },
            { title: "Strand Score", href: "#strand-score" },
            { title: "Credit Access", href: "#credit-access" },
            { title: "API Reference", href: "#api" }
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="rounded-lg border border-white/10 p-4 font-grotesk text-sm uppercase tracking-[0.18em] text-[#6FFF00] hover:border-[#6FFF00] hover:bg-white/5 transition-all"
            >
              {item.title}
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-12 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section id="getting-started">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Getting Started</h2>
            <p>
              Strand is a wallet-native work reputation protocol built on Solana. To get started:
            </p>
            <ol className="mt-4 ml-4 space-y-2 list-decimal">
              <li>Install a Solana wallet (Phantom, Solflare, or your preferred provider)</li>
              <li>Visit Strand and connect your wallet</li>
              <li>Complete your first verified work claim</li>
              <li>Watch your Strand Score update in real-time</li>
            </ol>
          </section>

          <section id="wallet-setup">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Wallet Setup & Security</h2>
            <p>
              Your wallet is your identity on Strand. Protect it carefully:
            </p>
            <ul className="mt-4 ml-4 space-y-2 list-disc">
              <li><strong>Never share your seed phrase</strong> – Only you should have access</li>
              <li><strong>Use a hardware wallet</strong> for large work credits (Ledger, Trezor)</li>
              <li><strong>Enable transaction signing</strong> – Verify all claims before approval</li>
              <li><strong>Keep software updated</strong> – Use latest wallet versions for security patches</li>
            </ul>
          </section>

          <section id="work-nfts">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Work NFTs & Verification</h2>
            <p>
              Work NFTs are cryptographic proof of completed projects. Each NFT contains:
            </p>
            <ul className="mt-4 ml-4 space-y-2 list-disc">
              <li><strong>Project metadata:</strong> Title, description, completion date</li>
              <li><strong>Client signature:</strong> Proof of work approval</li>
              <li><strong>On-chain timestamp:</strong> Immutable proof of when work was verified</li>
              <li><strong>Oracle attestation:</strong> Verified skills and quality metrics</li>
            </ul>
            <p className="mt-4">
              Once issued, Work NFTs cannot be modified or deleted. They live on the Solana blockchain permanently.
            </p>
          </section>

          <section id="strand-score">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Understanding Your Strand Score</h2>
            <p>
              Your Strand Score (0–1000) is calculated from:
            </p>
            <div className="mt-4 ml-4 space-y-3">
              <p><strong>40% – Work Completion Rate:</strong> Percentage of projects completed on time</p>
              <p><strong>30% – Consistency Signal:</strong> Regular work history and delivery frequency</p>
              <p><strong>20% – Skill Attestations:</strong> Oracle-verified competencies in your field</p>
              <p><strong>10% – Lender Feedback:</strong> Credit payment history and on-chain reputation</p>
            </div>
            <p className="mt-4">
              Your score updates daily based on new verified work and oracle data. Higher scores unlock larger credit lines.
            </p>
          </section>

          <section id="credit-access">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Accessing USDC Credit Lines</h2>
            <p>
              Strand connects you with lenders who underwrite based on your on-chain reputation:
            </p>
            <ol className="mt-4 ml-4 space-y-2 list-decimal">
              <li>Build work history (minimum 5 verified projects recommended)</li>
              <li>Achieve Strand Score of 400+ for initial credit eligibility</li>
              <li>Apply for USDC credit lines through Strand dashboard</li>
              <li>Lender reviews your score, work history, and prior repayment</li>
              <li>Upon approval, USDC is transferred directly to your wallet</li>
              <li>Repayments are on-chain via SPL token transfers</li>
            </ol>
            <p className="mt-4">
              Interest rates range from 8-18% APY based on your score. All terms are transparent and immutable.
            </p>
          </section>

          <section id="api">
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">API Reference & Smart Contracts</h2>
            <p>
              Strand protocol is open-source on GitHub: <code className="text-[#6FFF00]">github.com/manasdutta04/strand</code>
            </p>
            <div className="mt-4 ml-4 space-y-3">
              <p><strong>Strand Core Program:</strong> Work NFT issuance and verification</p>
              <p><strong>Strand Score Program:</strong> Score calculation and on-chain updates</p>
              <p><strong>Strand Credit Program:</strong> Credit line management and interest accrual</p>
            </div>
            <p className="mt-4">
              Full API documentation and integration examples available in the GitHub repository. Deploy contracts on Solana devnet or mainnet.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <p className="font-grotesk text-sm uppercase text-[#6FFF00]">Q: Why isn't my Work NFT showing up?</p>
                <p className="mt-2 ml-4">A: NFTs can take 5-30 seconds to appear on-chain. Refresh your browser and check Solana Explorer with your tx hash.</p>
              </div>
              <div>
                <p className="font-grotesk text-sm uppercase text-[#6FFF00]">Q: How do I dispute a work claim?</p>
                <p className="mt-2 ml-4">A: Open a dispute within 48 hours of claim. Both parties provide evidence; oracle adjudicators review and make final determination.</p>
              </div>
              <div>
                <p className="font-grotesk text-sm uppercase text-[#6FFF00]">Q: Can I transfer my work history to another wallet?</p>
                <p className="mt-2 ml-4">A: Work NFTs are tied to your wallet address. You can sell/transfer individual NFTs, but score history stays with the original address.</p>
              </div>
            </div>
          </section>
        </div>

        <Link href="/" className="mt-12 inline-flex rounded-full border border-white/15 px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF] hover:border-[#6FFF00] hover:text-[#6FFF00] transition-colors">
          Back home
        </Link>
      </div>
    </main>
  );
}
