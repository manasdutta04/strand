import fs from "node:fs";
import path from "node:path";

/**
 * Parse PDF file to base64 for vision models
 * For MVP, we'll just read the file as binary and convert to base64
 * (In production, use `pdf2pic` or `pdfjs` to convert to images first)
 */
export async function parsePdfToBase64(filePath: string): Promise<{
  base64: string;
  fileName: string;
  mimeType: string;
}> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");

  return {
    base64,
    fileName,
    mimeType: "application/pdf"
  };
}

/**
 * Extract worker pubkey and platform from filename
 * Expected format: {worker_pubkey}_{platform}_{timestamp}.pdf
 */
export function parseFileName(
  fileName: string
): { workerPubkey: string; platform: string; timestamp: number } | null {
  const match = fileName.match(/^([A-Za-z0-9]+)_([a-z]+)_(\d+)\.pdf$/i);
  if (!match) {
    return null;
  }

  return {
    workerPubkey: match[1],
    platform: match[2],
    timestamp: parseInt(match[3], 10)
  };
}

/**
 * List all unprocessed PDFs in uploads directory
 */
export async function listPendingPdfs(uploadsDir: string): Promise<string[]> {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const files = fs.readdirSync(uploadsDir);
  return files
    .filter((f) => f.endsWith(".pdf"))
    .map((f) => path.join(uploadsDir, f));
}

/**
 * Move processed PDF to archive directory
 */
export async function archivePdf(filePath: string, archiveDir: string): Promise<void> {
  const fileName = path.basename(filePath);
  const archivePath = path.join(archiveDir, fileName);

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  fs.renameSync(filePath, archivePath);
}
