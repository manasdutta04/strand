"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SaasShell } from "../../../../components/SaasShell";
import { RequireWallet } from "../../../../components/RequireWallet";
import { DEVNET_USDC_MINT } from "../../../../lib/constants";
import { executeOpenCreditLine } from "../../../../lib/tx-helpers";
import { formatErrorMessage } from "../../../../lib/error-formatter";

const NAV = [
  { label: "Portfolio", href: "/partner/dashboard" },
  { label: "Underwriting Queue", href: "/partner/dashboard/queue" }
];

export default function PartnerQueuePage() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = publicKey?.toBase58() ?? null;
  const [requests, setRequests] = useState<Array<{
    jobId: number;
    worker: string;
    amountUsdc: number;
    createdAt: string;
    status: "pending" | "approved" | "declined";
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingJob, setProcessingJob] = useState<number | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({});

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
            (data.approvals || []).map((approval: any) => ({
              jobId: approval.jobId,
              worker: approval.worker,
              amountUsdc: approval.amountUsdc,
              createdAt: approval.createdAt,
              status: "pending"
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load underwriting queue";
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

  async function approveRequest(jobId: number): Promise<void> {
    if (!publicKey || !sendTransaction) return;

    setProcessingJob(jobId);
    setActionErrors((prev) => ({ ...prev, [jobId]: "" }));

    const request = requests.find((r) => r.jobId === jobId);
    if (!request) {
      setProcessingJob(null);
      return;
    }

    try {
      const lenderTokenAccount = await getAssociatedTokenAddress(
        DEVNET_USDC_MINT,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      await executeOpenCreditLine(
        {
          connection,
          walletPublicKey: publicKey,
          sendTransaction
        },
        {
          lender: publicKey,
          worker: new PublicKey(request.worker),
          lenderTokenAccount,
          maxUsdc: request.amountUsdc,
          annualRateBps: 1200,
          minScoreRequired: 100
        }
      );

      setRequests((current) =>
        current.map((item) =>
          item.jobId === jobId ? { ...item, status: "approved" } : item
        )
      );
      setActionErrors((prev) => ({ ...prev, [jobId]: "" }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionErrors((prev) => ({ ...prev, [jobId]: errorMsg }));
      setRequests((current) =>
        current.map((item) =>
          item.jobId === jobId ? { ...item, status: "pending" } : item
        )
      );
    } finally {
      setProcessingJob(null);
    }
  }

  function declineRequest(jobId: number): void {
    setRequests((current) =>
      current.map((item) =>
        item.jobId === jobId ? { ...item, status: "declined" } : item
      )
    );
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
            <p className="text-sm text-destructive">
              {formatErrorMessage(error)}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading underwriting queue...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open escrow requests available for underwriting.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div key={request.jobId} className="space-y-1">
                  <div
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span>JOB-{request.jobId}</span>
                    <span>{request.worker.slice(0, 6)}…{request.worker.slice(-4)}</span>
                    <span>${request.amountUsdc.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        className="btn-subtle !px-3 !py-1.5 !text-xs"
                        disabled={request.status !== "pending" || processingJob === request.jobId}
                        onClick={() => declineRequest(request.jobId)}
                      >
                        {request.status === "declined" ? "Declined" : "Decline"}
                      </button>
                      <button
                        className="btn-accent !px-3 !py-1.5 !text-xs"
                        disabled={request.status !== "pending" || processingJob === request.jobId}
                        onClick={() => approveRequest(request.jobId)}
                      >
                        {processingJob === request.jobId
                          ? "Approving…"
                          : request.status === "approved"
                            ? "Approved"
                            : "Approve"}
                      </button>
                    </div>
                  </div>
                  {actionErrors[request.jobId] ? (
                    <p className="px-3 text-xs text-destructive">{actionErrors[request.jobId]}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
        {actionCount > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            {actionCount} underwriting action{actionCount === 1 ? "" : "s"} taken locally in this session.
          </div>
        ) : null}
      </SaasShell>
    </RequireWallet>
  );
}