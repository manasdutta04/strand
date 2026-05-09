"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface EarningsUploadProps {
  platform: string;
  onUploadStart?: () => void;
  onUploadComplete?: (fileName: string) => void;
}

export function EarningsUpload({ platform, onUploadStart, onUploadComplete }: EarningsUploadProps) {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !publicKey) {
      setError("Please connect wallet and select a file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    onUploadStart?.();

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("wallet", publicKey.toBase58());
      form.append("platform", platform);

      const resp = await fetch("/api/worker/upload", {
        method: "POST",
        body: form
      });

      const contentType = resp.headers.get("content-type") ?? "";
      let payload: any = null;

      if (contentType.includes("application/json")) {
        payload = await resp.json();
      } else {
        const text = await resp.text();
        if (!resp.ok) {
          throw new Error(text || `Upload failed (${resp.status})`);
        }
        // Non-JSON but successful response — fall back to original filename
        payload = { row: { file_name: file.name } };
      }

      if (!resp.ok) {
        throw new Error(payload?.error ?? "Upload failed");
      }

      const uploadedName = payload?.row?.file_name ?? file.name;
      setSuccessMessage(`Upload processed and saved to cloud: \"${uploadedName}\"`);
      
      // Wait 1 second to allow Supabase to process the insert before refreshing dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUploadComplete?.(uploadedName);
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif"
            onChange={handleFileSelect}
            disabled={isLoading || !publicKey}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="pointer-events-none relative z-0">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground/40"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-12l-3.172-3.172a4 4 0 00-5.656 0L28 12M12 32l3.172-3.172a4 4 0 015.656 0L32 32"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm font-medium">
              {isLoading ? "Uploading and analyzing..." : "Drag and drop your earnings PDF or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
            <p className="text-sm text-green-700 dark:text-green-400">✓ {successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
            <p className="text-sm text-red-700 dark:text-red-400">✗ {error}</p>
          </div>
        )}

        {!publicKey && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Please connect your wallet to upload earnings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
