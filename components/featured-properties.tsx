import Link from "next/link"
import React, { useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { getFeaturedProperties } from "@/lib/mock-data"

const FeaturedProperties = React.memo(function FeaturedProperties() {
  const featuredProperties = useMemo(() => getFeaturedProperties(), [])

  return (
    <section className="py-16 md:py-24 bg-[var(--sky-200)]/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium text-[var(--blue-400)] uppercase tracking-wider">
              Seleção exclusiva
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
              Imóveis em Destaque
            </h2>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="border-[var(--navy-700)] text-[var(--navy-700)] hover:bg-[var(--navy-700)] hover:text-white self-start md:self-auto bg-transparent"
          >
            <Link href="/imoveis">
              Ver todos os imóveis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  )
})

export { FeaturedProperties }
