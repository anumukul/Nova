export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CBZ2FWJBZYQWMYQ3XEXHPY6PFKGRIUDKWDPEDH2QG4RIGD6MQW3NUNQ4";

export const NATIVE_SAC =
  process.env.NEXT_PUBLIC_NATIVE_SAC ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://soroban-testnet.stellar.org";

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ||
  "https://horizon-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const READ_ACCOUNT =
  process.env.NEXT_PUBLIC_READ_ACCOUNT ||
  "GCOSPT6LRYTI5ZQQCZDJMJ7GPLPOSBTMIT3VNDGYKYP2ZT7SKPDUW4NI";

export const EXPLORER_TX =
  process.env.NEXT_PUBLIC_EXPLORER_TX ||
  "https://stellar.expert/explorer/testnet/tx";

export const EXPLORER_CONTRACT =
  process.env.NEXT_PUBLIC_EXPLORER_CONTRACT ||
  "https://stellar.expert/explorer/testnet/contract";

export const STROOPS_PER_XLM = 10_000_000;

export function stroopsToXlm(stroops: bigint | number | string): number {
  return Number(stroops) / STROOPS_PER_XLM;
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * STROOPS_PER_XLM));
}
