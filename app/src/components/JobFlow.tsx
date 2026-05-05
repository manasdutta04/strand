const STEPS = [
  {
    title: "Mint Work",
    description: "Client funds escrow. Worker and client dual-sign completion to mint a Work NFT."
  },
  {
    title: "Verify Skills",
    description:
      "Worker claims skills with a portfolio URL. The oracle validates evidence using local Ollama or user-supplied API keys for OpenAI, Groq, Gemini, or Claude."
  },
  {
    title: "Unlock Credit",
    description: "Lenders read Strand Score on-chain and issue undercollateralized USDC credit lines."
  }
];

export function JobFlow() {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6 pb-20">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">How it works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <article key={step.title} className="panel p-5">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Step {index + 1}</div>
            <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
