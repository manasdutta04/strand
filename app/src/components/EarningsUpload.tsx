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
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !publicKey) {
      setError("Please connect wallet and select a file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    onUploadStart?.();

    try {
      // Create filename in format: {pubkey}_{platform}_{timestamp}.pdf
      const timestamp = Date.now();
      const formattedFileName = `${publicKey.toBase58()}_${platform}_${timestamp}.pdf`;

      // In a real app, you would upload to oracle service or IPFS here
      // For now, we'll just simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFileName(formattedFileName);
      setSuccess(true);
      onUploadComplete?.(formattedFileName);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evidence drop box</CardTitle>
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
              {isLoading ? "Uploading..." : "Drag and drop your earnings PDF or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        {success && fileName && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ Upload queued! Oracle will process "{fileName}" within 1-5 minutes.
            </p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
