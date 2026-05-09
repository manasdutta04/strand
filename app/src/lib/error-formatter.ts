/**
 * Format technical error messages into user-friendly text
 */
export function formatErrorMessage(error: string | null | Error | unknown): string {
  if (!error) return "";

  // Convert non-string errors to string
  let errorStr = error;
  if (typeof errorStr !== 'string') {
    errorStr = errorStr instanceof Error ? errorStr.message : String(errorStr);
  }

  const lowerError = errorStr.toLowerCase();

  // Network errors
  if (lowerError.includes("network") || lowerError.includes("failed to fetch")) {
    return "Network connection issue. Please check your internet and try again.";
  }

  // Account not found
  if (
    lowerError.includes("account does not exist") ||
    lowerError.includes("account not found")
  ) {
    return "Account not found on-chain. This could mean you're new or the data hasn't synced yet.";
  }

  // RPC errors
  if (lowerError.includes("rpc") || lowerError.includes("http")) {
    return "Server connection failed. The blockchain network may be temporarily unavailable.";
  }

  // Invalid input
  if (lowerError.includes("invalid") || lowerError.includes("parse")) {
    return "There was a problem reading the data. Please refresh and try again.";
  }

  // Timeout
  if (lowerError.includes("timeout") || lowerError.includes("took too long")) {
    return "Request took too long. Please check your connection and try again.";
  }

  // Signature/wallet
  if (
    lowerError.includes("signature") ||
    lowerError.includes("wallet") ||
    lowerError.includes("sign")
  ) {
    return "Wallet signature failed. Please make sure your wallet is properly connected.";
  }

  // Insufficient balance
  if (lowerError.includes("insufficient")) {
    return "Insufficient balance. You don't have enough USDC or credits for this action.";
  }

  // Generic fallback - truncate if too long
  if (errorStr.length > 80) {
    return "Something went wrong. Please try again in a moment.";
  }

  return errorStr;
}
