"use client";

import { useWallet } from "../context/WalletContext";
import { EXPLORER_CONTRACT } from "../lib/constants";

export default function WalletButton() {
  const { address, isConnected, isWrongNetwork, connect, disconnect } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isWrongNetwork && (
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
          Wrong Network
        </span>
      )}
      <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
        <button
          onClick={copyAddress}
          className="text-sm text-slate-300 hover:text-white transition-colors"
          title="Copy address"
        >
          {truncateAddress(address!)}
        </button>
        <a
          href={`${EXPLORER_CONTRACT}/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm"
          title="View on explorer"
        >
          ↗
        </a>
        <button
          onClick={disconnect}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors ml-2"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
