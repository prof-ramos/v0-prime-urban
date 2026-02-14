import {
  Bed,
  Bath,
  Car,
  Maximize2,
  Sun,
  PawPrint,
  FileText,
  Compass,
  Building2,
  Ruler,
} from "lucide-react"
import type { Property } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { PROPERTY_TYPE_LABELS } from "@/lib/constants"

interface PropertyInfoProps {
  property: Property
}

export function PropertyInfo({ property }: PropertyInfoProps) {
  const monthlyCost = (property.condominiumFee || 0) + (property.iptu || 0)

  const features = [
    { icon: Bed, label: "Quartos", value: property.bedrooms },
    { icon: Bath, label: "Banheiros", value: property.bathrooms },
    { icon: Car, label: "Vagas", value: property.parkingSpaces },
    { icon: Maximize2, label: "Área privativa", value: `${property.privateArea}m²` },
    ...(property.totalArea ? [{ icon: Ruler, label: "Área total", value: `${property.totalArea}m²` }] : []),
    ...(property.suites ? [{ icon: Bed, label: "Suítes", value: property.suites }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="bg-primary text-primary-foreground">
            {PROPERTY_TYPE_LABELS[property.type]}
          </Badge>
          <Badge 
            variant="outline"
            className={`${
              property.transactionType === "venda"
                ? "border-primary text-primary"
                : "border-accent text-accent"
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
        
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
          {property.title}
        </h1>
        
        <p className="text-muted-foreground">
          {property.address} - {property.neighborhood}, Brasília - DF
        </p>
      </div>

      {/* Price Card */}
      <Card className="border-secondary/30 bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {property.transactionType === "venda" ? "Valor de venda" : "Valor mensal"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl md:text-4xl font-bold text-secondary">
            {formatCurrency(property.price)}
            {property.transactionType === "aluguel" && (
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
            )}
          </p>
          
          {monthlyCost > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              {property.condominiumFee && property.condominiumFee > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Condomínio</p>
                  <p className="font-semibold text-foreground">{formatCurrency(property.condominiumFee)}/mês</p>
                </div>
              )}
              {property.iptu && property.iptu > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">IPTU</p>
                  <p className="font-semibold text-foreground">{formatCurrency(property.iptu)}/mês</p>
                </div>
              )}
              <div className="col-span-2 pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground">Custo mensal total</p>
                <p className="font-bold text-lg text-secondary">
                  {formatCurrency(
                    (property.transactionType === "aluguel" ? property.price : 0) + monthlyCost
                  )}
                  /mês
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-muted">
                  <feature.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{feature.label}</p>
                  <p className="font-semibold text-foreground">{feature.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.solarOrientation && (
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Orientação solar</p>
                  <p className="font-medium">{property.solarOrientation}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <PawPrint className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Aceita pets</p>
                <p className="font-medium">{property.acceptsPets ? "Sim" : "Não"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo do imóvel</p>
                <p className="font-medium">{PROPERTY_TYPE_LABELS[property.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Documentação</p>
                <p className="font-medium">Em dia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
