import Link from "next/link";
import { ROLE_META } from "../lib/roles";

const ROLE_ORDER = ["worker", "client", "lender"] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="panel px-6 py-7">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">Strand SaaS</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Reputation Infrastructure For Work And Credit
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
            Choose your workspace role to continue. Each role has dedicated workflows, dashboards,
            and metrics for daily operation.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {ROLE_ORDER.map((roleKey) => {
            const role = ROLE_META[roleKey];
            return (
              <article key={role.role} className="panel flex flex-col p-5">
                <h2 className="text-xl font-semibold">{role.label}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{role.description}</p>
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
