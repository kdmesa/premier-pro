import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ServicesSection from "@/components/ServicesSection";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function BuilderLanding() {
  return (
    <main>
      <Navigation />
      <Hero />
      <HowItWorks />
      <ServicesSection />
      <Reviews />
      <Contact />
      <Footer />
    </main>
  );
}
