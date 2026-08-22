"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { contribute } from "../lib/contract";
import { getXlmBalance } from "../lib/balance";
import { xlmToStroops } from "../lib/constants";
import TxStatus, { TxStatusType } from "./TxStatus";
import { classifyError } from "../lib/errors";

interface ContributeFormProps {
  onSuccess: () => void;
}

export default function ContributeForm({ onSuccess }: ContributeFormProps) {
  const { address, isConnected, isWrongNetwork } = useWallet();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<TxStatusType>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  useEffect(() => {
    if (address) {
      getXlmBalance(address)
        .then(setBalance)
        .catch(() => setBalance(null));
    }
  }, [address, status]);

  useEffect(() => {
    if (status === "success" || status === "failed") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setTxHash(undefined);
        setErrorMsg(undefined);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const amountXlm = parseFloat(amount) || 0;
  const isValidAmount = amountXlm > 0 && amountXlm <= 7;
  const hasEnoughBalance = balance !== null && amountXlm <= balance - 1;
  const canSubmit =
    isConnected && !isWrongNetwork && isValidAmount && hasEnoughBalance && status === "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !canSubmit) return;

    try {
      setStatus("preparing");
      setErrorMsg(undefined);
      setTxHash(undefined);

      const stroops = xlmToStroops(amountXlm).toString();

      const outcome = await contribute(address, stroops, (newStatus, hash) => {
        setStatus(newStatus);
        if (hash) setTxHash(hash);
      });

      setAmount("");
      onSuccess();
    } catch (error: any) {
      const classified = classifyError(error);
      setStatus("failed");
      setErrorMsg(classified.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400">Connect your wallet to contribute</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <h3 className="text-xl font-bold mb-4">Contribute to Nova</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Amount (XLM)
          </label>
          <input
            type="number"
            step="0.0000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={status !== "idle"}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          {balance !== null && (
            <p className="text-xs text-slate-500 mt-1">
              Balance: {balance.toFixed(2)} XLM
            </p>
          )}
          {amountXlm > 0 && !hasEnoughBalance && (
            <p className="text-xs text-red-400 mt-1">
              Insufficient XLM balance for this contribution.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "idle" ? "Contribute" : "Processing..."}
        </button>
      </form>

      <TxStatus status={status} hash={txHash} error={errorMsg} />
    </div>
  );
}
