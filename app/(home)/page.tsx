import { HeroSection } from "@/components/hero-section-demo-1";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";
import TrustSection from "@/components/home/TrustSection";
import Testimonials from "@/components/home/Testimonials";
import PricingPreview from "@/components/home/PricingPreview";
import BlogVideoCard from "@/components/home/BlogVideoCard";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <Features />
      <HowItWorks />
      <Stats />
      <TrustSection />
      <Testimonials />
      <PricingPreview />
      <BlogVideoCard />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
