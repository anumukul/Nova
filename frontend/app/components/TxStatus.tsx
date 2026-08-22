"use client";

import { EXPLORER_TX } from "../lib/constants";

export type TxStatusType =
  | "idle"
  | "preparing"
  | "signing"
  | "pending"
  | "success"
  | "failed";

interface TxStatusProps {
  status: TxStatusType;
  hash?: string;
  error?: string;
}

export default function TxStatus({ status, hash, error }: TxStatusProps) {
  if (status === "idle") return null;

  const truncateHash = (h: string) => `${h.slice(0, 8)}...${h.slice(-8)}`;

  const copyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border border-slate-700">
      {status === "preparing" && (
        <div className="flex items-center gap-3 text-blue-400">
          <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
          <span>Simulating transaction...</span>
        </div>
      )}

      {status === "signing" && (
        <div className="flex items-center gap-3 text-yellow-400">
          <div className="animate-pulse h-5 w-5 bg-yellow-400 rounded-full" />
          <span>Awaiting wallet signature...</span>
        </div>
      )}

      {status === "pending" && hash && (
        <div className="flex items-center gap-3 text-blue-400">
          <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
          <div className="flex-1">
            <p className="font-medium">Submitting transaction...</p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyHash}
                className="text-sm text-blue-300 hover:text-blue-200 font-mono"
                title="Copy hash"
              >
                {truncateHash(hash)}
              </button>
              <a
                href={`${EXPLORER_TX}/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-300 hover:text-blue-200"
              >
                View on Explorer ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {status === "success" && hash && (
        <div className="bg-green-500/10 border-green-500/20">
          <div className="flex items-start gap-3 text-green-400">
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="font-medium">Transaction successful!</p>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-300/70">Hash:</span>
                  <button
                    onClick={copyHash}
                    className="text-sm text-green-300 hover:text-green-200 font-mono"
                    title="Copy hash"
                  >
                    {truncateHash(hash)}
                  </button>
                </div>
                <a
                  href={`${EXPLORER_TX}/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-300 hover:text-green-200 inline-flex items-center gap-1"
                >
                  View on Explorer ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="bg-red-500/10 border-red-500/20">
          <div className="flex items-start gap-3 text-red-400">
            <span className="text-xl">❌</span>
            <div className="flex-1">
              <p className="font-medium">Transaction failed</p>
              {error && <p className="text-sm text-red-300 mt-1">{error}</p>}
              {hash && (
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-300/70">Hash:</span>
                    <button
                      onClick={copyHash}
                      className="text-sm text-red-300 hover:text-red-200 font-mono"
                      title="Copy hash"
                    >
                      {truncateHash(hash)}
                    </button>
                  </div>
                  <a
                    href={`${EXPLORER_TX}/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-300 hover:text-red-200 inline-flex items-center gap-1"
                  >
                    View on Explorer ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
