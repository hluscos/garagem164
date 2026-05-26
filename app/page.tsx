import Header from "./components/Header";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import BrandsRow from "./components/BrandsRow";
import FeatureCards from "./components/FeatureCards";
import AuctionGrid from "./components/AuctionGrid";

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      <Header />

      <Hero />

      <StatsBar />

      <BrandsRow />

      <FeatureCards />

      <AuctionGrid />

    </main>
  );
}