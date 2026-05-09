import Link from "next/link";

function RoleCard({
  href,
  title,
  description,
  accent
}: {
  href: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#6FFF00]/40 hover:shadow-[0_20px_55px_rgba(111,255,0,0.16)]"
    >
      <div className={`mb-4 h-1.5 w-20 rounded-full ${accent}`} />
      <h2 className="strand-display text-2xl text-[#EFF4FF]">{title}</h2>
      <p className="mt-3 font-mono text-sm text-[#EFF4FF]/75">{description}</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#6FFF00]/30 bg-[#6FFF00]/10 px-3 py-1.5 font-grotesk text-[11px] uppercase tracking-[0.18em] text-[#6FFF00] transition group-hover:bg-[#6FFF00]/20">
        Open
      </div>
    </Link>
  );
}

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-[#010828] px-4 py-10 sm:px-6 lg:px-16 text-[#EFF4FF]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
          <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00]">Select Workspace</p>
          <h1 className="strand-display mt-2 text-3xl text-[#EFF4FF] sm:text-4xl">Who Are You?</h1>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <RoleCard
            href="/login/worker"
            title="Worker"
            description="Track work records, score, and credit readiness."
            accent="bg-[linear-gradient(90deg,#6fff00,#c8ff80)]"
          />
          <RoleCard
            href="/login/partner"
            title="Partner"
            description="Review queue, monitor portfolio, and underwrite borrowers."
            accent="bg-[linear-gradient(90deg,#76a9ff,#9f7bff)]"
          />
        </div>
      </div>
    </main>
  );
}
