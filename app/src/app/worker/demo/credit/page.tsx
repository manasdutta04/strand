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
      <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo Mode</p>
            <p className="mt-1 font-medium text-foreground">This page shows simulated credit information.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-6">
        <CreditPanel data={DEMO_CREDIT_DATA} demoMode={true} />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Strand Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight">{DEMO_CREDIT_DATA.score}</div>
              <p className="text-xs text-muted-foreground mt-2">Score builds with delivery history</p>
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight text-primary">{DEMO_CREDIT_DATA.apr}%</div>
              <p className="text-xs text-muted-foreground mt-2">Annual percentage rate (APR)</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base">How Credit Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">1. Build Your Score</p>
              <p className="text-xs text-muted-foreground">Complete deliveries and maintain high ratings</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">2. Unlock Credit</p>
              <p className="text-xs text-muted-foreground">Your score determines your credit limit</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">3. Access Capital</p>
              <p className="text-xs text-muted-foreground">Borrow USD or stablecoins at fixed rates</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">4. Repay Automatically</p>
              <p className="text-xs text-muted-foreground">Payments deducted from future earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SaasShell>
  );
}
