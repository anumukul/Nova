"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getContribution } from "../lib/contract";
import { stroopsToXlm } from "../lib/constants";

interface MyContributionProps {
  refreshKey: number;
}

export default function MyContribution({ refreshKey }: MyContributionProps) {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setAmount(BigInt(0));
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const contrib = await getContribution(address);
        setAmount(contrib);
      } catch {
        setAmount(BigInt(0));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [address, refreshKey]);

  if (!isConnected) return null;

  const xlm = stroopsToXlm(amount);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-2">My Contribution</h3>
      {loading ? (
        <div className="h-8 bg-slate-800 rounded animate-pulse w-1/2" />
      ) : (
        <p className="text-3xl font-bold text-white">
          {xlm.toFixed(4)}{" "}
          <span className="text-sm text-slate-400">XLM</span>
        </p>
      )}
    </div>
  );
}
