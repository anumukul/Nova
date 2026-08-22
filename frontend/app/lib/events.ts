import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { RPC_URL, CONTRACT_ID } from "./constants";

const server = new rpc.Server(RPC_URL);

export interface ContribEvent {
  contributor: string;
  amount: bigint;
  ledger: number;
}

export async function fetchContribEvents(startLedger?: number) {
  const latest = await server.getLatestLedger();
  const start = startLedger ?? Math.max(latest.sequence - 8000, 1);

  const res = await server.getEvents({
    startLedger: start,
    filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
    limit: 100,
  });

  const events: ContribEvent[] = res.events
    .filter((e) => {
      try {
        return scValToNative(e.topic[0]) === "contrib";
      } catch {
        return false;
      }
    })
    .map((e) => ({
      contributor: scValToNative(e.topic[1]) as string,
      amount: scValToNative(e.value) as bigint,
      ledger: e.ledger,
    }));

  return { events, nextLedger: res.latestLedger + 1 };
}
