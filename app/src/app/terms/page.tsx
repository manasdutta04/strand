import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-24 text-[#EFF4FF] sm:px-6 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-grotesk text-xs uppercase tracking-[0.3em] text-[#6FFF00]">Terms</p>
        <h1 className="mt-6 font-grotesk text-[42px] uppercase leading-none sm:text-[64px]">Terms of service</h1>
        <p className="mt-6 max-w-2xl font-mono text-[14px] leading-relaxed text-[#EFF4FF]/75 sm:text-[16px]">
          These terms govern access to Strand and its wallet-native reputation workflow.
          This page is a placeholder route for the footer links.
        </p>
        <Link href="/" className="mt-10 inline-flex rounded-full border border-white/15 px-6 py-3 font-grotesk text-xs uppercase tracking-[0.22em] text-[#EFF4FF]">
          Back home
        </Link>
      </div>
    </main>
  );
}
