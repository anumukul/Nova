"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import NetworkBanner from "./components/NetworkBanner";
import CampaignCard from "./components/CampaignCard";
import ContributeForm from "./components/ContributeForm";
import MyContribution from "./components/MyContribution";
import ActivityFeed from "./components/ActivityFeed";
import { getCampaign, CampaignData } from "./lib/contract";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await getCampaign();
        setCampaign(data);
      } catch (error) {
        console.error("Failed to fetch campaign:", error);
      }
    };
    fetchCampaign();
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Header />
      <NetworkBanner />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <CampaignCard campaign={campaign} />
            <ActivityFeed refreshKey={refreshKey} />
          </div>
          <div className="space-y-8">
            <ContributeForm campaign={campaign} onSuccess={handleSuccess} />
            <MyContribution refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </>
  );
}
