import Link from "next/link";
import { SaasShell } from "../../../../components/SaasShell";
import { ScoreBreakdown } from "../../../../components/ScoreBreakdown";
import { WorkRecordsDisplay } from "../../../../components/WorkRecordsDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/demo/dashboard" },
  { label: "Work History", href: "/worker/demo/work" },
  { label: "Skills", href: "/worker/demo/skills" },
  { label: "Credit", href: "/worker/demo/credit" }
];

const PLATFORMS = [
  { name: "zomato", label: "Zomato" },
  { name: "swiggy", label: "Swiggy" },
  { name: "blinkit", label: "Blinkit" },
  { name: "ola", label: "Ola" },
  { name: "uber", label: "Uber" },
  { name: "urban_company", label: "Urban Company" }
];

const INR_TO_USD_RATE = 83;

// Seeded demo data
const DEMO_WORK_RECORDS = [
  {
    id: "1",
    platform: "zomato",
    created_at: "2024-05-05T10:30:00Z",
    earning_amount_usdc: 15,
    delivery_count: 12
  },
  {
    id: "2",
    platform: "swiggy",
    created_at: "2024-05-06T14:15:00Z",
    earning_amount_usdc: 12,
    delivery_count: 9
  },
  {
    id: "3",
    platform: "blinkit",
    created_at: "2024-05-04T09:45:00Z",
    earning_amount_usdc: 19,
    delivery_count: 18
  },
  {
    id: "4",
    platform: "uber",
    created_at: "2024-05-02T16:20:00Z",
    earning_amount_usdc: 25,
    delivery_count: 22
  },
  {
    id: "5",
    platform: "zomato",
    created_at: "2024-04-30T11:00:00Z",
    earning_amount_usdc: 17,
    delivery_count: 15
  }
];

const DEMO_SCORE_COMPONENTS = {
  consistency: 85,
  volume: 72,
  reliability: 88,
  growth: 65
};

const DEMO_TOTAL_SCORE = 310;

export default function WorkerDemoDashboardPage() {
  return (
    <SaasShell
      productLabel="Worker Workspace · Demo"
      title="Dashboard"
      subtitle="Explore the product with simulated worker data."
      nav={NAV}
    >
      <div className="mb-6 rounded-2xl border border-[#6FFF00]/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-[#EFF4FF]/75 shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00]">Demo Mode</p>
            <p className="mt-1 font-grotesk font-medium text-[#EFF4FF]">Wallet is optional here. The demo loads instantly.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[#6FFF00] font-grotesk">
            <span className="rounded-full border border-[#6FFF00]/20 bg-white/5 backdrop-blur-sm px-3 py-1">No wallet needed</span>
            <span className="rounded-full border border-[#6FFF00]/20 bg-white/5 backdrop-blur-sm px-3 py-1">Simulated earnings</span>
            <span className="rounded-full border border-[#6FFF00]/20 bg-white/5 backdrop-blur-sm px-3 py-1">Instant score</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-grotesk text-lg font-semibold text-[#EFF4FF]">Add Earnings</h2>
            <p className="font-mono text-sm text-[#EFF4FF]/75">Upload a screenshot from one of your delivery platforms</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              disabled
              className="px-4 py-2 rounded-lg font-grotesk font-medium whitespace-nowrap transition-colors bg-white/5 text-[#EFF4FF]/60 cursor-not-allowed opacity-60"
            >
              {platform.label}
            </button>
          ))}
        </div>

        <Card className="border border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <p className="text-center font-mono text-sm text-[#EFF4FF]/75">
              Upload disabled in demo mode. <Link href="/worker/dashboard" className="text-[#6FFF00] hover:underline">Open real dashboard</Link> to upload earnings.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-grotesk text-lg font-semibold text-[#EFF4FF] mb-4">Reputation Score</h2>
          <ScoreBreakdown
            components={DEMO_SCORE_COMPONENTS}
            totalScore={DEMO_TOTAL_SCORE}
            inrRate={INR_TO_USD_RATE}
          />
        </div>

        <div>
          <h2 className="font-grotesk text-lg font-semibold text-[#EFF4FF] mb-4">Work History</h2>
          <WorkRecordsDisplay
            records={DEMO_WORK_RECORDS}
            inrRate={INR_TO_USD_RATE}
            isLoading={false}
          />
        </div>

        <Card className="border-2 border-[#6FFF00]/20 bg-gradient-to-br from-[#6FFF00]/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-grotesk text-base text-[#EFF4FF]">Credit Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-mono text-sm text-[#EFF4FF]/75">
              Your Strand Score determines how much credit you can access. Build your reputation by adding work
              records and maintaining consistent earnings.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60 mb-2">Status</p>
                <p className="font-grotesk text-lg font-semibold">
                  <span className="text-yellow-500">Build Score</span>
                </p>
              </div>
              <div>
                <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#EFF4FF]/60 mb-2">Next Step</p>
                <Link
                  href="/worker/demo/credit"
                  className="font-grotesk text-sm font-medium text-[#6FFF00] hover:underline"
                >
                  View Credit →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SaasShell>
  );
}
