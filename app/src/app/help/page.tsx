import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Help</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Help Center</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Frequently asked questions, troubleshooting, and how to get support.
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Account & Wallet</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I sign up?</h3>
                <p className="ml-4">A: Download Phantom or Solflare wallet, connect to Strand, and you're ready to go. No email or password needed—your wallet is your account.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What if I lose access to my wallet?</h3>
                <p className="ml-4">A: Your recovery phrase is the only way to access your account. Keep it safe in a secure location. Strand cannot recover lost wallets. If you have multiple devices with your seed phrase, you can access your account from any device.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Can I use multiple wallets with Strand?</h3>
                <p className="ml-4">A: Yes. Each wallet has its own Work NFT history and Strand Score. Work and credit are tied to the wallet address, not a single account.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Is my data on Strand secure?</h3>
                <p className="ml-4">A: Work history and scores are stored on the Solana blockchain—immutable and secure. Strand doesn't hold your funds or private keys. You control everything through your wallet.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Work & Verification</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I get work verified?</h3>
                <p className="ml-4">A: After completing a project, claim it on Strand with project details. The client approves the claim, and an oracle verifies the work. Once verified, a Work NFT is issued to your wallet.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Can I claim work retroactively?</h3>
                <p className="ml-4">A: Yes, but claims must be verified within 90 days of completion. Older claims require partner approval. This prevents score manipulation.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What happens if my claim is disputed?</h3>
                <p className="ml-4">A: Clients have 48 hours to dispute. Both parties submit evidence. Strand oracles review and make a binding decision. Incorrect claims damage your reputation and lower your score.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How long does verification take?</h3>
                <p className="ml-4">A: Most claims are verified within 24 hours. During high volume, verification can take up to 72 hours. You'll receive a notification when your Work NFT is issued.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Strand Score</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What is my Strand Score?</h3>
                <p className="ml-4">A: Your score (0–1000) reflects your work reliability, consistency, and partner history. Higher scores unlock better credit terms. Score updates daily based on new work and oracle data.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How can I improve my score?</h3>
                <p className="ml-4">A: Complete work consistently and on time. Build skills in high-demand areas. Pay back credit lines without defaults. Each positive action compounds your score over time.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Can I see my score breakdown?</h3>
                <p className="ml-4">A: Yes. Your Strand dashboard shows the 4 score components: Completion Rate (40%), Consistency (30%), Skills (20%), and Partner Feedback (10%).</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What if my score drops?</h3>
                <p className="ml-4">A: Missed deadlines, disputes, or credit defaults lower your score. Focus on completing work and building trust to recover. Score penalties fade over time as new positive work accumulates.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Credit & Lending</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I access credit?</h3>
                <p className="ml-4">A: Build work history (5+ projects), achieve a Strand Score of 400+, then apply for USDC credit lines. Partners review your on-chain reputation and decide in 24-48 hours.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What interest rates should I expect?</h3>
                <p className="ml-4">A: Rates range from 8–18% APY depending on your score and partner. Higher scores = lower rates. All terms are transparent on-chain before you borrow.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: How do I repay credit?</h3>
                <p className="ml-4">A: Use the Strand dashboard to send USDC repayment from your wallet. Interest is automatically calculated. Payments are instant on-chain and tracked in your credit history.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What happens if I miss a payment?</h3>
                <p className="ml-4">A: Late payments trigger penalties and damage your partner feedback score. After 30 days overdue, partners can initiate on-chain collection. Defaults can result in account restrictions.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Can I refinance my credit line?</h3>
                <p className="ml-4">A: Yes. If your score improves, apply for a new line at better rates. Use the proceeds to pay off higher-rate debt. All refinancing happens on-chain.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Technical & Troubleshooting</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What blockchain does Strand use?</h3>
                <p className="ml-4">A: Strand is built on Solana. All work history, scores, and credit are recorded on the Solana mainnet using SPL tokens for credit lines.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: What wallet providers are supported?</h3>
                <p className="ml-4">A: Phantom, Solflare, Ledger, and most Solana-compatible wallets. We recommend hardware wallets for large credit amounts.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: Is Strand available on mobile?</h3>
                <p className="ml-4">A: Yes. Use Phantom or Solflare mobile apps and visit Strand through the in-app browser. Full mobile support for work claims and credit management.</p>
              </div>
              <div>
                <h3 className="font-grotesk text-sm uppercase text-[#6FFF00] mb-2">Q: I'm getting a transaction error. What do I do?</h3>
                <p className="ml-4">A: Check you have SOL for transaction fees. Ensure your wallet is up to date. Try a different RPC endpoint if Solana network is congested. Contact support if issues persist.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-6">Get Support</h2>
            <div className="space-y-4">
              <p>
                <strong>Email:</strong> <code className="text-[#6FFF00]">support@strandprotocol.com</code>
              </p>
              <p>
                <strong>GitHub Issues:</strong> <code className="text-[#6FFF00]">github.com/manasdutta04/strand/issues</code>
              </p>
              <p>
                <strong>Discord Community:</strong> Join our community for live support and discussions
              </p>
              <p>
                <strong>Response Time:</strong> Most inquiries answered within 24 hours
              </p>
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
