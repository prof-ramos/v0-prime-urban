import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NEIGHBORHOODS } from "@/lib/constants"

// Neighborhood counts for display purposes
const NEIGHBORHOOD_COUNTS: Record<string, number> = {
  "asa-sul": 87,
  "asa-norte": 92,
  "aguas-claras": 156,
  "sudoeste": 64,
  "noroeste": 45,
  "lago-sul": 38,
}

// Combine iterations: Pre-filter neighborhoods to avoid filter+map in render
const ACTIVE_NEIGHBORHOODS = NEIGHBORHOODS.filter(n => n.value in NEIGHBORHOOD_COUNTS)

export function NeighborhoodsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-secondary uppercase tracking-wider">
            Explore por região
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4 text-balance">
            Bairros de Brasília
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Conheça os melhores bairros da capital federal e encontre o lugar perfeito para você morar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ACTIVE_NEIGHBORHOODS.map((neighborhood) => (
            <Link
              key={neighborhood.value}
              href={`/bairros/${neighborhood.value}`}
              className="group relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground transition-all duration-300 hover:bg-accent hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative z-10">
                <h3 className="font-semibold text-lg mb-1">{neighborhood.name}</h3>
                <p className="text-xs text-primary-foreground/60 mb-3">{neighborhood.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">
                    {NEIGHBORHOOD_COUNTS[neighborhood.value]} imóveis
                  </span>
                  <ArrowRight className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/10 rounded-full transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
