import { SaasShell } from "../../../../components/SaasShell";
import { CreditPanel } from "../../../../components/CreditPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/demo/dashboard" },
  { label: "Work History", href: "/worker/demo/work" },
  { label: "Skills", href: "/worker/demo/skills" },
  { label: "Credit", href: "/worker/demo/credit" }
];

// Seeded demo credit data
const DEMO_CREDIT_DATA = {
  score: 310,
  maxCreditUsd: 2500,
  availableCreditUsd: 2500,
  borrowedUsd: 0,
  borrowLimitUsd: 2500,
  apr: 12.5,
  nextPaymentDue: "2024-06-06T00:00:00Z"
};

export default function WorkerDemoCreditPage() {
  return (
    <SaasShell
      productLabel="Worker Workspace · Demo"
      title="Credit Access"
      subtitle="View your credit line and borrowing options."
      nav={NAV}
    >
      <div className="mb-6 rounded-2xl border border-[#6FFF00]/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-[#EFF4FF]/75 shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00]">Demo Mode</p>
            <p className="mt-1 font-grotesk font-medium text-[#EFF4FF]">This page shows simulated credit information.</p>
          </div>
          <span className="rounded-full border border-[#6FFF00]/20 bg-white/5 backdrop-blur-sm px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#6FFF00] font-grotesk font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-6">
        <CreditPanel data={DEMO_CREDIT_DATA} demoMode={true} />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-wide text-[#EFF4FF]/60">
                Strand Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-grotesk text-4xl font-bold tracking-tight text-[#EFF4FF]">{DEMO_CREDIT_DATA.score}</div>
              <p className="font-mono text-xs text-[#EFF4FF]/75 mt-2">Score builds with delivery history</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="font-grotesk text-sm font-medium uppercase tracking-wide text-[#EFF4FF]/60">
                Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-grotesk text-4xl font-bold tracking-tight text-[#6FFF00]">{DEMO_CREDIT_DATA.apr}%</div>
              <p className="font-mono text-xs text-[#EFF4FF]/75 mt-2">Annual percentage rate (APR)</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-[#6FFF00]/20 bg-gradient-to-br from-[#6FFF00]/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-grotesk text-base text-[#EFF4FF]">How Credit Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#EFF4FF]">1. Build Your Score</p>
              <p className="font-mono text-xs text-[#EFF4FF]/75">Complete deliveries and maintain high ratings</p>
            </div>
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#EFF4FF]">2. Unlock Credit</p>
              <p className="font-mono text-xs text-[#EFF4FF]/75">Your score determines your credit limit</p>
            </div>
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#EFF4FF]">3. Access Capital</p>
              <p className="font-mono text-xs text-[#EFF4FF]/75">Borrow USD or stablecoins at fixed rates</p>
            </div>
            <div>
              <p className="font-grotesk text-sm font-semibold text-[#EFF4FF]">4. Repay Automatically</p>
              <p className="font-mono text-xs text-[#EFF4FF]/75">Payments deducted from future earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SaasShell>
  );
}
