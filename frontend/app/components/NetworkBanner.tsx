"use client";

import { useWallet } from "../context/WalletContext";

export default function NetworkBanner() {
  const { isWrongNetwork, isConnected } = useWallet();

  if (!isConnected || !isWrongNetwork) {
    return null;
  }

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-red-400 text-sm">
          ⚠️ Switch your wallet to <strong>Testnet</strong> to use Nova
        </p>
      </div>
    </div>
  );
}
