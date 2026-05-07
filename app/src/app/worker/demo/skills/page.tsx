import { SaasShell } from "../../../../components/SaasShell";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

const NAV = [
  { label: "Overview", href: "/worker/demo/dashboard" },
  { label: "Work History", href: "/worker/demo/work" },
  { label: "Skills", href: "/worker/demo/skills" },
  { label: "Credit", href: "/worker/demo/credit" }
];

// Seeded demo skills
const DEMO_SKILLS = [
  { name: "Delivery Efficiency", confidence: 92 },
  { name: "Route Optimization", confidence: 88 },
  { name: "Customer Service", confidence: 95 },
  { name: "Time Management", confidence: 85 },
  { name: "Vehicle Maintenance", confidence: 78 },
  { name: "Safety Compliance", confidence: 91 }
];

export default function WorkerDemoSkillsPage() {
  return (
    <SaasShell
      productLabel="Worker Workspace · Demo"
      title="Skills & Certifications"
      subtitle="Skills inferred from your delivery history and platform ratings."
      nav={NAV}
    >
      <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo Mode</p>
            <p className="mt-1 font-medium text-foreground">This page shows simulated skill attestations.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-4">
        {DEMO_SKILLS.map((skill) => (
          <Card key={skill.name} className="border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Confidence score from work data</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-primary">{skill.confidence}%</p>
                  <div className="mt-1 h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base">Skill Attestations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your skills are automatically detected from your delivery history and ratings across gig platforms.
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Higher confidence = more reliable skill assessment</li>
            <li>Build experience to unlock new skill verifications</li>
            <li>Skills are verified on-chain for credit decisions</li>
          </ul>
        </CardContent>
      </Card>
    </SaasShell>
  );
}
