import Header from "./_components/Header";
import HeroSection from "./_components/HeroSection";
import ShowcaseSection from "./_components/ShowcaseSection";
import AnySizeSection from "./_components/AnySizeSection";
import FeaturesSection from "./_components/FeaturesSection";
import UseCasesSection from "./_components/UseCasesSection";
import HowItWorksSection from "./_components/HowItWorksSection";
import KeyFeaturesSection from "./_components/KeyFeaturesSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import PricingSection from "./_components/PricingSection";
import FAQSection from "./_components/FAQSection";
import Footer from "./_components/Footer";
import CTASection from "./_components/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-brand-blue selection:text-white">
      <Header />
      <section className="hero-glow min-h-screen flex flex-col">
        <HeroSection />
        <ShowcaseSection />
        <AnySizeSection />
        <FeaturesSection />
        <UseCasesSection />
        <HowItWorksSection />
        <KeyFeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </section>
      <Footer />
    </main>
  );
}
