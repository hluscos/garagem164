import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import BrandsRow from "./components/BrandsRow";
import FeatureCards from "./components/FeatureCards";
import AuctionGrid from "./components/AuctionGrid";
import Footer from "./components/Footer";
import SeoIntro from "./components/SeoIntro";

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">
      <Hero />
      <StatsBar />
      <BrandsRow />
      <FeatureCards />
      <SeoIntro />
      <AuctionGrid />
      <Footer />
    </main>
  );
}
