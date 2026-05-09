"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SaasShell } from "../../../../components/SaasShell";
import { RequireWallet } from "../../../../components/RequireWallet";
import { formatErrorMessage } from "../../../../lib/error-formatter";

const NAV = [
  { label: "Portfolio", href: "/partner/dashboard" },
  { label: "Underwriting Queue", href: "/partner/dashboard/queue" }
];

interface ApprovalItem {
  recordId: string;
  worker: string;
  amountUsdc: number;
  createdAt: string;
  status: "pending" | "approved" | "declined";
}

interface ApprovalApiItem {
  recordId: string;
  worker: string;
  amountUsdc: number;
  createdAt: string;
  status: "pending" | "approved";
}

export default function PartnerQueuePage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [requests, setRequests] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRecordId, setProcessingRecordId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!wallet) {
      setRequests([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/partner/pending-approvals");
        if (!resp.ok) {
          const j = await resp.json();
          throw new Error(j?.error ?? "Failed to load pending approvals");
        }
        const data = await resp.json();
        if (!cancelled) {
          setRequests(
            ((data.approvals || []) as ApprovalApiItem[]).map((approval) => ({
              recordId: approval.recordId,
              worker: approval.worker,
              amountUsdc: approval.amountUsdc,
              createdAt: approval.createdAt,
              status: approval.status === "approved" ? "approved" : "pending"
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load underwriting queue";
          setError(errorMessage);
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

  async function updateRequestStatus(
    recordId: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    setProcessingRecordId(recordId);
    setActionErrors((prev) => ({ ...prev, [recordId]: "" }));

    try {
      const resp = await fetch(`/api/partner/approvals/${encodeURIComponent(recordId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = await resp.json();
      if (!resp.ok) {
        throw new Error(payload?.error ?? "Failed to update approval status");
      }

      setRequests((current) =>
        current.map((item) =>
          item.recordId === recordId
            ? { ...item, status: status === "approved" ? "approved" : "declined" }
            : item
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionErrors((prev) => ({ ...prev, [recordId]: errorMsg }));
    } finally {
      setProcessingRecordId(null);
    }
  }

  return (
    <RequireWallet redirectTo="/login/partner">
      <SaasShell
        productLabel="Partner Workspace"
        title="Underwriting Queue"
        subtitle="Review and approve credit lines for score-verified borrowers."
        nav={NAV}
      >
        <section className="panel p-4">
          {error ? (
            <p className="text-sm text-destructive">{formatErrorMessage(error)}</p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading underwriting queue...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending records available.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div key={request.recordId} className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                    <span>{request.recordId.slice(0, 8)}</span>
                    <span>{request.worker.slice(0, 6)}...{request.worker.slice(-4)}</span>
                    <span>${request.amountUsdc.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="btn-subtle !px-3 !py-1.5 !text-xs"
                        disabled={request.status !== "pending" || processingRecordId === request.recordId}
                        onClick={() => updateRequestStatus(request.recordId, "rejected")}
                      >
                        {request.status === "declined" ? "Declined" : "Decline"}
                      </button>
                      <button
                        className="btn-accent !px-3 !py-1.5 !text-xs"
                        disabled={request.status !== "pending" || processingRecordId === request.recordId}
                        onClick={() => updateRequestStatus(request.recordId, "approved")}
                      >
                        {processingRecordId === request.recordId
                          ? "Updating..."
                          : request.status === "approved"
                          ? "Approved"
                          : "Approve"}
                      </button>
                    </div>
                  </div>
                  {actionErrors[request.recordId] ? (
                    <p className="px-3 text-xs text-destructive">{actionErrors[request.recordId]}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
        {actionCount > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            {actionCount} underwriting action{actionCount === 1 ? "" : "s"} taken in this session.
          </div>
        ) : null}
      </SaasShell>
    </RequireWallet>
  );
}
