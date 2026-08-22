import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  allowAllModules,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "./constants";

let kitInstance: StellarWalletsKit | null = null;

function getKit(): StellarWalletsKit {
  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }
  return kitInstance;
}

export const kit = new Proxy({} as StellarWalletsKit, {
  get(_, prop) {
    return (getKit() as any)[prop];
  },
});

export async function openWalletModal(onPicked: (address: string) => void) {
  const k = getKit();
  await k.openModal({
    onWalletSelected: async (option: ISupportedWallet) => {
      k.setWallet(option.id);
      const { address } = await k.getAddress();
      onPicked(address);
    },
  });
}

export async function signXdr(xdr: string, address: string): Promise<string> {
  const k = getKit();
  const { signedTxXdr } = await k.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  return signedTxXdr;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const k = getKit();
    const { address } = await k.getAddress();
    return address;
  } catch {
    return null;
  }
}
