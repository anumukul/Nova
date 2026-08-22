function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const CONTRACT_ID = requireEnv("NEXT_PUBLIC_CONTRACT_ID");
export const NATIVE_SAC = requireEnv("NEXT_PUBLIC_NATIVE_SAC");
export const RPC_URL = requireEnv("NEXT_PUBLIC_RPC_URL");
export const HORIZON_URL = requireEnv("NEXT_PUBLIC_HORIZON_URL");
export const NETWORK_PASSPHRASE = requireEnv("NEXT_PUBLIC_NETWORK_PASSPHRASE");
export const READ_ACCOUNT = requireEnv("NEXT_PUBLIC_READ_ACCOUNT");
export const EXPLORER_TX = requireEnv("NEXT_PUBLIC_EXPLORER_TX");
export const EXPLORER_CONTRACT = requireEnv("NEXT_PUBLIC_EXPLORER_CONTRACT");

export const STROOPS_PER_XLM = 10_000_000;

export function stroopsToXlm(stroops: bigint | number | string): number {
  return Number(stroops) / STROOPS_PER_XLM;
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * STROOPS_PER_XLM));
}
