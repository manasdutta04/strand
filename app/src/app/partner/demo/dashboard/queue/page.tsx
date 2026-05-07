"use client";

import Link from "next/link";
import { SaasShell } from "../../../../../components/SaasShell";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";

const NAV = [
  { label: "Portfolio", href: "/partner/demo/dashboard" },
  { label: "Underwriting Queue", href: "/partner/demo/dashboard/queue" }
];

// Seeded demo queue requests
const DEMO_QUEUE_REQUESTS = [
  { jobId: 1, worker: "8Y3kP1mQ6n2jV5sL9", amountUsdc: 300, createdAt: "2024-05-07T03:00:00Z", status: "pending" as const },
  { jobId: 2, worker: "5X7cR2nQ4m1jL9sK3", amountUsdc: 450, createdAt: "2024-05-07T01:00:00Z", status: "pending" as const },
  { jobId: 3, worker: "1W9fT4pZ6v3nK7sM2", amountUsdc: 250, createdAt: "2024-05-06T23:00:00Z", status: "pending" as const },
];

export default function PartnerDemoQueuePage() {
  return (
    <SaasShell
      productLabel="Partner Workspace · Demo"
      title="Underwriting Queue"
      subtitle="Review and approve credit lines for workers."
      nav={NAV}
    >
      <div className="mb-6 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(118,169,255,0.14),rgba(255,255,255,0.03))] px-4 py-4 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(118,169,255,0.08),0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Demo Mode</p>
            <p className="mt-1 font-medium text-foreground">This page shows simulated credit requests.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary font-medium">Seeded data</span>
        </div>
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Credit Requests</h2>
            <p className="text-sm text-muted-foreground">Review and approve credit lines for workers</p>
          </div>
          <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
            {DEMO_QUEUE_REQUESTS.length} Pending
          </span>
        </div>

        <div className="space-y-3">
          {DEMO_QUEUE_REQUESTS.map((request) => {
            const date = new Date(request.createdAt);
            const hoursAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
            return (
              <div
                key={request.jobId}
                className="rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Worker {request.worker.slice(0, 6)}…{request.worker.slice(-4)}</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requested ${request.amountUsdc.toLocaleString()} USDC • {hoursAgo}h ago
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">${request.amountUsdc.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Requested amount</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    disabled
                    className="flex-1 px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium cursor-not-allowed opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled
                    className="flex-1 px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium cursor-not-allowed opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-border/50 text-sm text-muted-foreground">
          Actions disabled in demo mode. <Link href="/partner/dashboard" className="text-primary hover:underline">Open real workspace</Link> to approve requests.
        </div>
      </div>

      <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base">Underwriting Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">1. Review Worker Score</p>
            <p className="text-xs text-muted-foreground">Verify the worker's on-chain reputation and delivery history</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">2. Evaluate Risk</p>
            <p className="text-xs text-muted-foreground">Check their track record and current utilization rate</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">3. Approve or Decline</p>
            <p className="text-xs text-muted-foreground">Set the credit line amount and APR based on risk profile</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">4. Deploy Capital</p>
            <p className="text-xs text-muted-foreground">Capital is deployed to the worker's account immediately</p>
          </div>
        </CardContent>
      </Card>
    </SaasShell>
  );
}
