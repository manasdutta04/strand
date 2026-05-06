import Image from "next/image";
import Link from "next/link";
import { ROLE_META } from "../../lib/roles";

const ROLE_ORDER = ["worker", "client", "lender"] as const;

export default function WhoPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="panel px-6 py-7">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Strand" width={20} height={20} className="rounded" style={{ width: "20px", height: "20px" }} />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Strand</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Work and credit, in one system.
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base" style={{ color: "hsl(var(--foreground))" }}>
            Choose a workspace to continue.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {ROLE_ORDER.map((roleKey) => {
            const role = ROLE_META[roleKey];
            return (
              <article key={role.role} className="panel flex flex-col p-5">
                <h2 className="text-xl font-semibold">{role.label}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{role.description}</p>
                <Link className="btn-accent mt-4" href={`/login/${role.role}`}>
                  Continue As {role.label}
                </Link>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
