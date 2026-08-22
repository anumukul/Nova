import Header from "./components/Header";
import NetworkBanner from "./components/NetworkBanner";
import CampaignCard from "./components/CampaignCard";

export default function Home() {
  return (
    <>
      <Header />
      <NetworkBanner />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid gap-8">
          <CampaignCard />
        </div>
      </main>
    </>
  );
}
