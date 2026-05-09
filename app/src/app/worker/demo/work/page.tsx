import { SaasShell } from "../../../../components/SaasShell";
import { WorkNFTCard } from "../../../../components/WorkNFTCard";
import { Card, CardContent } from "../../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/demo/dashboard" },
  { label: "Work History", href: "/worker/demo/work" },
  { label: "Skills", href: "/worker/demo/skills" },
  { label: "Credit", href: "/worker/demo/credit" }
];

// Seeded demo work NFTs - matching WorkNFTCardData interface
const DEMO_WORK_NFTS = [
  {
    client: "5K2mXqJ9vb6p2KwL3nClient1",
    amountUsdc: 15,
    skills: ["Delivery Efficiency", "Customer Service"],
    clientRating: 4.8,
    completedAt: "2024-05-05T10:30:00Z",
    explorerUrl: "#"
  },
  {
    client: "7R7cR2nQ4m1jL9sK3Client2",
    amountUsdc: 12,
    skills: ["Route Optimization", "Time Management"],
    clientRating: 4.9,
    completedAt: "2024-05-06T14:15:00Z",
    explorerUrl: "#"
  },
  {
    client: "3W9fT4pZ6v3nK7sM2Client3",
    amountUsdc: 19,
    skills: ["Safety Compliance", "Vehicle Maintenance"],
    clientRating: 4.7,
    completedAt: "2024-05-04T09:45:00Z",
    explorerUrl: "#"
  },
  {
    client: "8Y3kP1mQ6n2jV5sL9Client4",
    amountUsdc: 25,
    skills: ["Delivery Efficiency", "Safety Compliance"],
    clientRating: 4.8,
    completedAt: "2024-05-02T16:20:00Z",
    explorerUrl: "#"
  },
  {
    client: "2N4dV7sW1y5jF8hK6xClient5",
    amountUsdc: 17,
    skills: ["Customer Service", "Time Management"],
    clientRating: 4.9,
    completedAt: "2024-04-30T11:00:00Z",
    explorerUrl: "#"
  },
  {
    client: "1W9fT4pZ6v3nK7sM2Client6",
    amountUsdc: 21,
    skills: ["Delivery Efficiency", "Route Optimization"],
    clientRating: 4.6,
    completedAt: "2024-04-27T13:30:00Z",
    explorerUrl: "#"
  }
];

export default function WorkerDemoWorkHistoryPage() {
  return (
    <SaasShell
      productLabel="Worker Workspace · Demo"
      title="Build Your Reputation"
      subtitle="Your work history — verified earnings and delivery quality."
      nav={NAV}
      showSettings={true}
    >
      <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo Mode</p>
            <p className="mt-1 font-medium text-foreground">This page shows simulated work history.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium">Seeded data</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-3 md:grid-cols-2">
            {DEMO_WORK_NFTS.map((item) => (
              <WorkNFTCard key={item.client} data={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </SaasShell>
  );
}
