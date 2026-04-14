import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import HeroSection from '@/components/HeroSection';
import CategoryShowcase from '@/components/CategoryShowcase';
import FeaturedProducts from '@/components/FeaturedProducts';
import MarketInfoSection from '@/components/MarketInfoSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
      <MarketInfoSection />
      <Footer />
    </div>
  );
};

export default Index;
