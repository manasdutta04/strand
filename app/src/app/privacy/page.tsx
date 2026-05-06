import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Privacy</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Privacy policy</h1>
        <p className="mt-6 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[15px]">
          Last updated: May 6, 2026
        </p>

        <div className="mt-12 space-y-8 font-mono text-[14px] leading-relaxed text-[#EFF4FF]/80 sm:text-[15px]">
          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">1. Overview</h2>
            <p>
              Strand ("we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our wallet-native work reputation and credit protocol on the Solana blockchain.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">2. Blockchain Data & Public Records</h2>
            <p>
              Strand operates on the Solana blockchain. Your wallet address, work NFTs, Strand Score, and credit history are stored on-chain and are publicly visible to the blockchain. We cannot delete, modify, or make private any data once it is recorded on the Solana blockchain. All blockchain transactions are permanent and immutable.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">3. Information We Collect</h2>
            <div className="space-y-3">
              <p><strong>Wallet Address:</strong> We collect your Solana wallet address when you connect to Strand.</p>
              <p><strong>Work History:</strong> Verified work completions, client names, project descriptions, and delivery dates.</p>
              <p><strong>Attestations:</strong> Skill verifications, references, and lender assessments tied to your wallet.</p>
              <p><strong>Usage Data:</strong> How you interact with Strand (login times, features used, platform activity).</p>
              <p><strong>Device Information:</strong> Browser type, IP address, operating system (for platform analytics and security).</p>
            </div>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">4. How We Use Your Information</h2>
            <ul className="space-y-2 ml-4 list-disc">
              <li>To verify work completion and issue Work NFTs</li>
              <li>To calculate and maintain your Strand Score</li>
              <li>To facilitate credit access and lender underwriting</li>
              <li>To prevent fraud and enforce our Terms of Service</li>
              <li>To improve and maintain the Strand platform</li>
              <li>To send you security alerts and platform updates</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">5. Data Sharing & Third Parties</h2>
            <p>
              <strong>Lenders:</strong> We share your work history and Strand Score with partner lenders when you apply for credit. Lenders use this data for underwriting and credit decisions.
            </p>
            <p className="mt-3">
              <strong>Clients & Workers:</strong> When you work with other users on Strand, they may view your work history and Strand Score.
            </p>
            <p className="mt-3">
              <strong>Service Providers:</strong> We may use third-party analytics providers, security firms, and blockchain infrastructure providers who must agree to maintain data confidentiality.
            </p>
            <p className="mt-3">
              <strong>Legal Compliance:</strong> We may disclose your information if required by law or court order.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security and are not liable for unauthorized access to your data or blockchain account.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">7. Wallet Security</h2>
            <p>
              Strand does not store your private keys, seed phrases, or passwords. You are solely responsible for securing your wallet. If your wallet is compromised, we cannot recover your account or assets. We recommend using hardware wallets for significant holdings.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">8. User Rights & Data Access</h2>
            <p>
              <strong>Access:</strong> You can access your work history and Strand Score at any time through your wallet connection.
            </p>
            <p className="mt-3">
              <strong>Portability:</strong> Your work history and score are tied to your wallet address and are portable across all platforms that use Strand.
            </p>
            <p className="mt-3">
              <strong>Deletion:</strong> Since data is recorded on the Solana blockchain, we cannot delete your work history or on-chain records. You can disconnect from Strand, but your existing on-chain data will remain.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">9. Cookies & Tracking</h2>
            <p>
              Strand uses cookies and similar tracking technologies for platform functionality, security, and analytics. You can control cookie settings in your browser, but some features may not work properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">10. Children's Privacy</h2>
            <p>
              Strand is not intended for users under 18 years old. We do not knowingly collect information from minors. If we become aware of unauthorized use by a minor, we will take steps to remove the account.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">11. International Users</h2>
            <p>
              Strand is a global platform. By using Strand, you consent to the transfer of your information internationally. Different jurisdictions may have different data protection laws; however, your on-chain data is subject to Solana blockchain's immutable ledger.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">12. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Continued use of Strand constitutes acceptance of any updates. We will notify users of material changes via platform notification or email.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-xl uppercase text-[#EFF4FF] mb-4">13. Contact Us</h2>
            <p>
              For privacy inquiries or data access requests, contact us at: privacy@strandprotocol.com or via GitHub at github.com/manasdutta04/strand
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
