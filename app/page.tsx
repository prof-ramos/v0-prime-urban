import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import dynamic from "next/dynamic"
import { Footer } from "@/components/footer"

// Dynamically import below-the-fold components to reduce initial bundle size
const FeaturedProperties = dynamic(() => import("@/components/featured-properties").then(m => ({ default: m.FeaturedProperties })), {
  loading: () => <div className="py-16 md:py-24 bg-[var(--sky-200)]/20 animate-pulse" aria-label="Carregando imóveis em destaque..." />,
})

const NeighborhoodsSection = dynamic(() => import("@/components/neighborhoods-section").then(m => ({ default: m.NeighborhoodsSection })), {
  loading: () => <div className="py-16 md:py-24 bg-background animate-pulse" aria-label="Carregando bairros..." />,
})

const WhatsAppCTA = dynamic(() => import("@/components/whatsapp-cta").then(m => ({ default: m.WhatsAppCTA })), {
  loading: () => <div className="py-16 md:py-24 bg-accent animate-pulse" aria-label="Carregando..." />,
})

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
