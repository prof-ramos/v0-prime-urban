import Image from "next/image"
import Link from "next/link"
import { Bed, Bath, Car, Maximize2, MapPin, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface Property {
  id: string
  slug: string
  title: string
  type: "apartamento" | "casa" | "cobertura" | "sala_comercial"
  transactionType: "venda" | "aluguel"
  price: number
  condoFee?: number
  iptu?: number
  neighborhood: string
  address: string
  privateArea: number
  totalArea?: number
  bedrooms: number
  suites?: number
  bathrooms: number
  parkingSpaces: number
  images: string[]
  featured?: boolean
  acceptsPets?: boolean
  solarOrientation?: string
}

interface PropertyCardProps {
  property: Property
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const typeLabels: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  cobertura: "Cobertura",
  sala_comercial: "Sala Comercial",
}

export function PropertyCard({ property }: PropertyCardProps) {
  const monthlyCost = (property.condoFee || 0) + (property.iptu || 0)

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-secondary transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0] || "/placeholder-property.jpg"}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge 
            className={`${
              property.transactionType === "venda" 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent text-accent-foreground"
            }`}
          >
            {property.transactionType === "venda" ? "Venda" : "Aluguel"}
          </Badge>
          {property.featured && (
            <Badge className="bg-secondary text-secondary-foreground">
              Destaque
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-card/90 hover:bg-card transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Adicionar aos favoritos"
        >
          <Heart className="h-5 w-5 text-primary" />
        </button>

        {/* Type Label */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-card/90 backdrop-blur text-sm font-medium text-foreground rounded-full">
            {typeLabels[property.type]}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{property.neighborhood} - Brasília</span>
        </div>

        {/* Title */}
        <Link href={`/imoveis/${property.slug}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-secondary transition-colors min-h-[3rem]">
            {property.title}
          </h3>
        </Link>

        {/* Price Section */}
        <div className="mt-3 pb-3 border-b border-border/50">
          <p className="text-xl font-bold text-secondary">
            {formatCurrency(property.price)}
            {property.transactionType === "aluguel" && (
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            )}
          </p>
          {monthlyCost > 0 && (
            <p className="text-sm text-muted-foreground">
              + {formatCurrency(monthlyCost)}/mês (cond. + IPTU)
            </p>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-2 mt-3 text-sm text-foreground/80">
          <div className="flex flex-col items-center gap-1">
            <Maximize2 className="h-4 w-4 text-secondary" />
            <span>{property.privateArea}m²</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bed className="h-4 w-4 text-secondary" />
            <span>{property.bedrooms} qts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bath className="h-4 w-4 text-secondary" />
            <span>{property.bathrooms} ban</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Car className="h-4 w-4 text-secondary" />
            <span>{property.parkingSpaces} vag</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
