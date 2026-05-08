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
      <div className="mb-6 rounded-2xl border border-[#6FFF00]/20 bg-[linear-gradient(135deg,rgba(111,255,0,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-[#EFF4FF]/75 shadow-[0_0_0_1px_rgba(111,255,0,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-grotesk text-xs uppercase tracking-[0.2em] text-[#6FFF00]">Demo Mode</p>
            <p className="mt-1 font-grotesk font-medium text-[#EFF4FF]">This page shows simulated skill attestations.</p>
          </div>
          <span className="rounded-full border border-[#6FFF00]/20 bg-white/5 backdrop-blur-sm px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#6FFF00] font-grotesk font-medium">Seeded data</span>
        </div>
      </div>

      <div className="space-y-4">
        {DEMO_SKILLS.map((skill) => (
          <Card key={skill.name} className="border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-grotesk font-medium text-[#EFF4FF]">{skill.name}</p>
                  <p className="font-mono text-xs text-[#EFF4FF]/75 mt-1">Confidence score from work data</p>
                </div>
                <div className="text-right">
                  <p className="font-grotesk text-2xl font-semibold text-[#6FFF00]">{skill.confidence}%</p>
                  <div className="mt-1 h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6FFF00] transition-all"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-2 border-[#6FFF00]/20 bg-gradient-to-br from-[#6FFF00]/5 to-transparent">
        <CardHeader>
          <CardTitle className="font-grotesk text-base text-[#EFF4FF]">Skill Attestations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-mono text-sm text-[#EFF4FF]/75">
            Your skills are automatically detected from your delivery history and ratings across gig platforms.
          </p>
          <ul className="list-disc list-inside font-mono text-sm text-[#EFF4FF]/75 space-y-1">
            <li>Higher confidence = more reliable skill assessment</li>
            <li>Build experience to unlock new skill verifications</li>
            <li>Skills are verified on-chain for credit decisions</li>
          </ul>
        </CardContent>
      </Card>
    </SaasShell>
  );
}
