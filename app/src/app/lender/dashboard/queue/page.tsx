"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SaasShell } from "../../../../components/SaasShell";
import { RequireWallet } from "../../../../components/RequireWallet";
import { listOpenJobEscrows } from "../../../../lib/data-access";

const NAV = [
  { label: "Portfolio", href: "/lender/dashboard" },
  { label: "Underwriting Queue", href: "/lender/dashboard/queue" }
];

export default function LenderQueuePage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [requests, setRequests] = useState<Array<{
    jobId: number;
    worker: string;
    amountUsdc: number;
    createdAt: string;
    status: "pending" | "approved" | "declined";
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!wallet) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      try {
        const openJobs = await listOpenJobEscrows();
        if (!cancelled) {
          setRequests(
            openJobs.slice(0, 6).map((job) => ({
              jobId: job.jobId,
              worker: job.worker,
              amountUsdc: job.amountUsdc,
              createdAt: job.createdAt,
              status: "pending"
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setRequests([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const actionCount = useMemo(
    () => requests.filter((request) => request.status !== "pending").length,
    [requests]
  );

  function approveRequest(jobId: number): void {
    setRequests((current) =>
      current.map((item) =>
        item.jobId === jobId ? { ...item, status: "approved" } : item
      )
    );
  }

  function declineRequest(jobId: number): void {
    setRequests((current) =>
      current.map((item) =>
        item.jobId === jobId ? { ...item, status: "declined" } : item
      )
    );
  }

  return (
    <RequireWallet redirectTo="/login/lender">
      <SaasShell
        productLabel="Lender Workspace"
        title="Underwriting Queue"
        subtitle="Evaluate incoming credit requests using score and work proof signals."
        nav={NAV}
      >
        <section className="panel p-4">
          {isLoading ? (
            <p className="text-sm text-muted">Loading underwriting queue...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted">No open escrow requests available for underwriting.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.jobId}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 rounded-lg border border-border bg-[#141414] px-3 py-2 text-sm"
                >
                  <span>JOB-{request.jobId}</span>
                  <span>{request.worker.slice(0, 6)}…{request.worker.slice(-4)}</span>
                  <span>${request.amountUsdc.toLocaleString()}</span>
                  <span className="text-muted text-xs">{new Date(request.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button
                      className="btn-subtle !px-3 !py-1.5 !text-xs"
                      disabled={request.status !== "pending"}
                      onClick={() => declineRequest(request.jobId)}
                    >
                      {request.status === "declined" ? "Declined" : "Decline"}
                    </button>
                    <button
                      className="btn-accent !px-3 !py-1.5 !text-xs"
                      disabled={request.status !== "pending"}
                      onClick={() => approveRequest(request.jobId)}
                    >
                      {request.status === "approved" ? "Approved" : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {actionCount > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-[#101010] p-4 text-sm text-muted">
            {actionCount} underwriting action{actionCount === 1 ? "" : "s"} taken locally in this session.
          </div>
        ) : null}
      </SaasShell>
    </RequireWallet>
  );
}
