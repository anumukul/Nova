export interface ClassifiedError {
  type: string;
  message: string;
}

export function classifyError(error: any): ClassifiedError {
  const message = error?.message || String(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("not installed") ||
    lower.includes("not found") ||
    lower.includes("unavailable") ||
    lower.includes("no wallet")
  ) {
    return {
      type: "wallet_not_found",
      message: "That wallet isn't installed. Install it or pick another wallet.",
    };
  }

  if (
    lower.includes("reject") ||
    lower.includes("declin") ||
    lower.includes("cancel") ||
    lower.includes("denied") ||
    lower.includes("user")
  ) {
    return {
      type: "user_rejected",
      message: "You cancelled the request in your wallet.",
    };
  }

  if (
    lower.includes("insufficient") ||
    lower.includes("balance") ||
    lower.includes("trustline")
  ) {
    return {
      type: "insufficient_balance",
      message: "Insufficient XLM balance for this contribution.",
    };
  }

  if (lower.includes("network") || lower.includes("passphrase")) {
    return {
      type: "wrong_network",
      message: "Switch your wallet to Testnet.",
    };
  }

  if (lower.includes("campaign") || lower.includes("ended")) {
    return {
      type: "campaign_ended",
      message: "This campaign has ended.",
    };
  }

  if (lower.includes("invalid") || lower.includes("amount")) {
    return {
      type: "invalid_amount",
      message: "Enter a valid amount greater than 0.",
    };
  }

  if (lower.includes("fetch") || lower.includes("rpc")) {
    return {
      type: "network_error",
      message: "Network error. Please try again.",
    };
  }

  return {
    type: "unknown",
    message: "Transaction failed. Please try again.",
  };
}
