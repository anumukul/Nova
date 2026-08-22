"use client";

import WalletButton from "./WalletButton";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Nova
          </h1>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            Testnet
          </span>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
