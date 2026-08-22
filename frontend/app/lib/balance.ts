import { HORIZON_URL } from "./constants";

export async function getXlmBalance(address: string): Promise<number> {
  const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch balance");
  }
  const data = await response.json();
  const nativeBalance = data.balances.find(
    (b: any) => b.asset_type === "native"
  );
  return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
}
