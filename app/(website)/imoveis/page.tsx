import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import type { FilterState } from "@/lib/types"
import { getProperties } from "@/lib/api"
import type { Property } from "@/lib/types"
import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import client-side filters component
const PropertyFiltersClient = dynamic(() =>
  import("./filters-client").then(m => ({ default: m.PropertyFiltersClient })), {
  loading: () => <div role="status" className="bg-card border border-border/50 rounded-xl p-4 mb-6 animate-pulse h-32" aria-label="Carregando filtros..." />,
  ssr: true,
})

export const revalidate = 300 // Revalida a cada 5 minutos (ISR)

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Server Component que busca dados do datasource atual e renderiza a página
 * Client-side filtering é delegado ao PropertyFiltersClient
 */
export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  // Buscar todos os imóveis do datasource atual
  const properties = await getProperties().catch<Property[] | null>((error) => {
    console.error('Erro ao buscar imóveis:', error)
    return null
  })

  if (!properties) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="bg-[var(--navy-900)] py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
                Imóveis em Brasília
              </h1>
              <p className="text-white/70">
                Encontre apartamentos, casas e coberturas nos melhores bairros da capital
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Banco de dados indisponível</h2>
              <p className="text-muted-foreground mb-6">
                Desculpe, não foi possível carregar os imóveis no momento.
              </p>
              <Button asChild>
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-[var(--navy-900)] py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
              Imóveis em Brasília
            </h1>
            <p className="text-white/70">
              Encontre apartamentos, casas e coberturas nos melhores bairros da capital
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Client-side Filters Component */}
          <PropertyFiltersClient properties={properties} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
