// ============= DOMAINS TYPES =============

/** Tipo de transação imobiliária (para filtros - inclui vazio) */
export type TransactionTypeFilter = "venda" | "aluguel" | ""

/** Tipo de transação de um imóvel (sem vazio) */
export type TransactionType = "venda" | "aluguel"

/** Tipo de imóvel (para filtros - inclui vazio) */
export type PropertyTypeFilter = "apartamento" | "casa" | "cobertura" | "sala_comercial" | ""

/** Tipo de imóvel (sem vazio) */
export type PropertyType = "apartamento" | "casa" | "cobertura" | "sala_comercial"

/** Quantidade de quartos em string para filtros */
export type BedroomCount = "1" | "2" | "3" | "4" | ""

/** Quantidade de vagas em string para filtros */
export type ParkingSpacesCount = "1" | "2" | "3" | ""

// ============= INTERFACES =============

/** Interface completa de um imóvel */
export interface Property {
  id: string
  slug: string
  title: string
  type: PropertyType
  transactionType: TransactionType
  address: string
  neighborhood: string
  price: number
  condominiumFee?: number
  iptu?: number
  privateArea: number
  totalArea?: number
  bedrooms: number
  suites?: number
  bathrooms: number
  parkingSpaces: number
  images: string[]
  description?: string
  amenities?: string[]
  featured?: boolean
  acceptsPets?: boolean
  solarOrientation?: string
}

/** Estado de filtros para busca de imóveis */
export interface FilterState {
  search: string
  transactionType: TransactionTypeFilter
  propertyType: PropertyTypeFilter
  neighborhood: string
  minPrice: number
  maxPrice: number
  bedrooms: BedroomCount
  parkingSpaces: ParkingSpacesCount
}

/** Props para componentes de cartão de propriedade */
export interface PropertyCardProps {
  property: Property
}
