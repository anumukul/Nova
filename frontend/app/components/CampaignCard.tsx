"use client";

import { useEffect, useState } from "react";
import { CampaignData } from "../lib/contract";
import { stroopsToXlm } from "../lib/constants";

interface CampaignCardProps {
  campaign: CampaignData | null;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!campaign) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Number(campaign.deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("Campaign ended");
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3 mb-6"></div>
        <div className="h-32 bg-slate-800 rounded"></div>
      </div>
    );
  }

  const goalXlm = stroopsToXlm(campaign.goal);
  const raisedXlm = stroopsToXlm(campaign.total_raised);
  const progress = Math.min((raisedXlm / goalXlm) * 100, 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-2">Nova Campaign</h2>
      <p className="text-slate-400 mb-6">
        Support the future of decentralized innovation
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-medium">{progress.toFixed(2)}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Raised</p>
            <p className="text-2xl font-bold text-white">
              {raisedXlm.toFixed(2)}{" "}
              <span className="text-sm text-slate-400">XLM</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Goal</p>
            <p className="text-2xl font-bold text-white">
              {goalXlm.toFixed(2)}{" "}
              <span className="text-sm text-slate-400">XLM</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Contributors</p>
            <p className="text-2xl font-bold text-white">
              {campaign.contributor_count}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Time Left</p>
            <p className="text-2xl font-bold text-white">{timeLeft}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
