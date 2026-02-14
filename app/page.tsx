import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { NeighborhoodsSection } from "@/components/neighborhoods-section"
import { WhatsAppCTA } from "@/components/whatsapp-cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProperties />
        <NeighborhoodsSection />
        <WhatsAppCTA />
      </main>
      <Footer />
    </div>
  )
}
