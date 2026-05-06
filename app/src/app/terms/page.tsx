import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Terms</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Terms of service</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Last updated: May 6, 2026
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using Strand, you agree to be bound by these Terms of Service. Strand ("we," "us," "our") is a wallet-native work reputation and credit protocol built on Solana. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">2. User Accounts & Wallets</h2>
            <p>
              You are responsible for maintaining the confidentiality of your Solana wallet private keys and seed phrases. Strand does not store your private keys. You are solely responsible for all activities that occur under your wallet address. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">3. Work NFTs & On-Chain Verification</h2>
            <p>
              Work NFTs issued through Strand represent verified work completion. These NFTs are cryptographic tokens on the Solana blockchain and cannot be modified, revoked, or deleted by Strand after issuance. Work verification is subject to oracle validation and the terms agreed upon at the time of verification.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">4. Strand Score & Reputation</h2>
            <p>
              Your Strand Score is calculated based on verified work history, on-time delivery, skill attestations, and lender assessments. The score is dynamic and may change as new verified work is added to your history. Strand does not guarantee any specific score calculation methodology and reserves the right to update scoring logic with notice.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">5. Credit Lines & Financial Terms</h2>
            <p>
              USDC credit lines offered through Strand are provided by partner lenders, not by Strand directly. Strand facilitates access to credit based on your on-chain work history and Strand Score. All credit terms, interest rates, repayment schedules, and penalties are determined by the lender. You are responsible for understanding and complying with your specific credit agreement.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">6. No Financial Advice</h2>
            <p>
              Strand does not provide financial, legal, or investment advice. All information on Strand is provided for informational purposes only. You are solely responsible for evaluating the merits and risks of any credit arrangement or financial product.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">7. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul className="mt-3 ml-4 space-y-2 list-disc">
              <li>Attempt to manipulate or artificially inflate your work history or Strand Score</li>
              <li>Fraudulently claim work completion or verification</li>
              <li>Use the platform for money laundering or illegal activities</li>
              <li>Harass, threaten, or defame other users</li>
              <li>Attempt to compromise platform security or access unauthorized systems</li>
              <li>Reverse-engineer or extract blockchain data beyond permitted uses</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">8. Disclaimers & Limitation of Liability</h2>
            <p>
              STRAND IS PROVIDED ON AN "AS-IS" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. STRAND DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. TO THE MAXIMUM EXTENT PERMITTED BY LAW, STRAND SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">9. Blockchain Risks</h2>
            <p>
              You acknowledge the inherent risks of blockchain technology including wallet compromise, transaction irreversibility, and smart contract vulnerabilities. Strand is not liable for losses resulting from blockchain failures, wallet security breaches, or network congestion.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">10. Changes to Terms</h2>
            <p>
              Strand reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms. We will notify users of material changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">11. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">12. Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at: support@strandprotocol.com or via our GitHub repository at github.com/manasdutta04/strand
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
