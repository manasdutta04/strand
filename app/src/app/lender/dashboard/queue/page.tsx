"use client";

import { SaasShell } from "../../../../components/SaasShell";

const NAV = [
  { label: "Portfolio", href: "/lender/dashboard" },
  { label: "Underwriting Queue", href: "/lender/dashboard/queue" }
];

const REQUESTS = [
  { worker: "A2v4...xP1M", requested: 3500, score: 722, term: "90d" },
  { worker: "B7m1...kQ4R", requested: 2100, score: 641, term: "60d" },
  { worker: "C9p8...fH5Z", requested: 5000, score: 785, term: "120d" }
];

export default function LenderQueuePage() {
  return (
    <SaasShell
      productLabel="Lender Workspace"
      title="Underwriting Queue"
      subtitle="Evaluate incoming credit requests using score and work proof signals."
      nav={NAV}
    >
      <section className="panel p-4">
        <div className="space-y-2">
          {REQUESTS.map((request) => (
            <div
              key={request.worker}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
            >
              <span>Worker {request.worker}</span>
              <span>Score {request.score}</span>
              <span>${request.requested.toLocaleString()}</span>
              <span>{request.term}</span>
              <div className="flex gap-2">
                <button className="btn-subtle !px-3 !py-1.5 !text-xs">Decline</button>
                <button className="btn-accent !px-3 !py-1.5 !text-xs">Approve</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SaasShell>
  );
}
