import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Share2, Heart } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { getPropertyBySlug, mockProperties } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { Metadata } from "next"

// Dynamically import property detail components to reduce initial bundle size
const PropertyGallery = dynamic(() => import("@/components/property-gallery").then(m => ({ default: m.PropertyGallery })), {
  loading: () => <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden bg-muted animate-pulse" aria-label="Carregando galeria..." />,
  ssr: true, // Images should be server-rendered for SEO
})

const PropertyInfo = dynamic(() => import("@/components/property-info").then(m => ({ default: m.PropertyInfo })), {
  loading: () => <div className="bg-card rounded-xl border border-border/50 p-6 animate-pulse" aria-label="Carregando informações..." />,
  ssr: true,
})

// Contact form dynamically imported (component itself is client-side)
const ContactForm = dynamic(() => import("@/components/contact-form").then(m => ({ default: m.ContactForm })), {
  loading: () => <div className="bg-card rounded-xl border border-border/50 p-6 animate-pulse sticky top-24" aria-label="Carregando formulário..." />,
})

interface PropertyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params
  const property = getPropertyBySlug(slug)
  
  if (!property) {
    return {
      title: "Imóvel não encontrado",
    }
  }

  return {
    title: property.title,
    description: `${property.type === "apartamento" ? "Apartamento" : property.type} ${
      property.transactionType === "venda" ? "à venda" : "para alugar"
    } em ${property.neighborhood}, Brasília. ${property.bedrooms} quartos, ${
      property.privateArea
    }m². ${formatCurrency(property.price)}`,
    openGraph: {
      title: property.title,
      description: `${property.bedrooms} quartos, ${property.privateArea}m² - ${formatCurrency(property.price)}`,
      images: property.images,
    },
  }
}

export async function generateStaticParams() {
  return mockProperties.map((property) => ({
    slug: property.slug,
  }))
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params
  const property = getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                href="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Início
              </Link>
              <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              <Link 
                href="/imoveis" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Imóveis
              </Link>
              <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {property.neighborhood}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border/50 min-h-[44px] bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border/50 min-h-[44px] bg-transparent"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favoritar
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gallery & Info */}
            <div className="lg:col-span-2 space-y-6">
              <PropertyGallery images={property.images} title={property.title} />
              <PropertyInfo property={property} />
              
              {/* Description */}
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="font-semibold text-lg mb-4">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Excelente {property.type} localizado em {property.neighborhood}, uma das regiões mais valorizadas de Brasília. 
                  O imóvel conta com {property.bedrooms} quartos{property.suites ? `, sendo ${property.suites} suíte(s)` : ""}, 
                  {property.bathrooms} banheiro(s) e {property.parkingSpaces} vaga(s) de garagem. 
                  Com {property.privateArea}m² de área privativa{property.totalArea ? ` e ${property.totalArea}m² de área total` : ""}, 
                  oferece conforto e praticidade para sua família.
                  {property.solarOrientation && ` Orientação solar ${property.solarOrientation}.`}
                  {property.acceptsPets && " Aceita pets."}
                </p>
              </div>

              {/* Location Placeholder */}
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="font-semibold text-lg mb-4">Localização</h2>
                <p className="text-muted-foreground mb-4">{property.address} - {property.neighborhood}, Brasília - DF</p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  Mapa interativo - Integração com Google Maps
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="lg:col-span-1">
              <ContactForm propertyTitle={property.title} propertyId={property.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
