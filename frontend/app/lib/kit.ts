import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  allowAllModules,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "./constants";

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export async function openWalletModal(onPicked: (address: string) => void) {
  await kit.openModal({
    onWalletSelected: async (option: ISupportedWallet) => {
      kit.setWallet(option.id);
      const { address } = await kit.getAddress();
      onPicked(address);
    },
  });
}

export async function signXdr(xdr: string, address: string): Promise<string> {
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  return signedTxXdr;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch {
    return null;
  }
}
