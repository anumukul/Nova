import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import {
  RPC_URL,
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  READ_ACCOUNT,
  EXPLORER_TX,
} from "./constants";
import { signXdr } from "./kit";

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

export interface TxOutcome {
  hash: string;
  explorerUrl: string;
}

export interface CampaignData {
  beneficiary: string;
  token: string;
  goal: bigint;
  deadline: bigint;
  total_raised: bigint;
  contributor_count: number;
  withdrawn: boolean;
}

async function readCall(method: string, ...args: xdr.ScVal[]) {
  const source = await server.getAccount(READ_ACCOUNT);
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error("simulation failed");
  }
  return scValToNative(sim.result!.retval);
}

export async function getCampaign(): Promise<CampaignData> {
  const result = await readCall("get_campaign");
  return {
    beneficiary: result.beneficiary,
    token: result.token,
    goal: BigInt(result.goal),
    deadline: BigInt(result.deadline),
    total_raised: BigInt(result.total_raised),
    contributor_count: Number(result.contributor_count),
    withdrawn: result.withdrawn,
  };
}

export async function getContribution(who: string): Promise<bigint> {
  const result = await readCall(
    "get_contribution",
    new Address(who).toScVal()
  );
  return BigInt(result);
}

async function pollTransactionStatus(hash: string): Promise<{ status: string; ledger?: number }> {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: { hash },
      }),
    });
    const json = await res.json();
    if (json.error) {
      return { status: "NOT_FOUND" };
    }
    return {
      status: json.result?.status ?? "NOT_FOUND",
      ledger: json.result?.ledger,
    };
  } catch {
    return { status: "NOT_FOUND" };
  }
}

export type TxStatusCallback = (status: "preparing" | "signing" | "pending" | "success" | "failed", hash?: string) => void;

export async function contribute(
  address: string,
  amountStroops: string,
  onStatus?: TxStatusCallback
): Promise<TxOutcome> {
  onStatus?.("preparing");
  const source = await server.getAccount(address);

  const op = contract.call(
    "contribute",
    new Address(address).toScVal(),
    nativeToScVal(BigInt(amountStroops), { type: "i128" })
  );

  const built = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(built);

  onStatus?.("signing");
  const signedXdr = await signXdr(prepared.toXDR(), address);
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const sent = await server.sendTransaction(signedTx);

  const hash = sent.hash;
  const explorerUrl = `${EXPLORER_TX}/${hash}`;

  if (sent.status === "ERROR") {
    throw Object.assign(new Error("Transaction submission failed"), { sendResult: sent });
  }

  onStatus?.("pending", hash);

  let attempts = 0;
  const maxAttempts = 40;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000));
    const result = await pollTransactionStatus(hash);

    if (result.status === "SUCCESS") {
      onStatus?.("success", hash);
      return { hash, explorerUrl };
    }

    if (result.status === "FAILED") {
      onStatus?.("failed", hash);
      throw Object.assign(new Error("Transaction failed on-chain"), { hash, explorerUrl });
    }

    attempts++;
  }

  onStatus?.("failed", hash);
  throw Object.assign(new Error("Transaction timed out waiting for confirmation"), { hash, explorerUrl });
}
