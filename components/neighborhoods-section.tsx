import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NEIGHBORHOODS_DF, NEIGHBORHOODS_GO, NEIGHBORHOODS_MG } from "@/lib/constants"

// Featured neighborhoods for hero display (DF)
const FEATURED_DF: Record<string, number> = {
  "plano-piloto": 134,
  "aguas-claras": 156,
  "taguatinga": 112,
  "sudoeste-octogonal": 64,
  "lago-sul": 38,
  "guara": 89,
  "ceilandia": 97,
  "samambaia": 72,
}

// Featured municipalities from RIDE
const FEATURED_RIDE: Record<string, number> = {
  "valparaiso-de-goias": 48,
  "aguas-lindas-de-goias": 35,
  "luziania-go": 29,
  "novo-gama": 22,
  "formosa-go": 18,
  "unai-mg": 12,
}

const FEATURED_DF_LIST = NEIGHBORHOODS_DF.filter(n => n.value in FEATURED_DF)
const FEATURED_RIDE_LIST = [
  ...NEIGHBORHOODS_GO.filter(n => n.value in FEATURED_RIDE),
  ...NEIGHBORHOODS_MG.filter(n => n.value in FEATURED_RIDE),
]

export function NeighborhoodsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-secondary uppercase tracking-wider">
            Explore por região
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4 text-balance">
            Regiões Administrativas do DF
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Conheça as principais regiões administrativas do Distrito Federal e municípios do Entorno.
          </p>
        </div>

        {/* DF Regions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {FEATURED_DF_LIST.map((neighborhood) => (
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
                    {FEATURED_DF[neighborhood.value]} imóveis
                  </span>
                  <ArrowRight className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/10 rounded-full transition-transform group-hover:scale-150" />
            </Link>
          ))}
        </div>

        {/* RIDE Section */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
            Entorno - RIDE
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm text-pretty">
            Municípios da Região Integrada de Desenvolvimento do DF e Entorno (Goiás e Minas Gerais).
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {FEATURED_RIDE_LIST.map((municipality) => (
            <Link
              key={municipality.value}
              href={`/bairros/${municipality.value}`}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 text-foreground transition-all duration-300 hover:border-secondary/50 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base">{municipality.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {municipality.region}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{municipality.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">
                    {FEATURED_RIDE[municipality.value]} imóveis
                  </span>
                  <ArrowRight className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
