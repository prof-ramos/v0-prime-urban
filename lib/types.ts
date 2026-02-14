// ============= DOMAINS TYPES =============

/** Tipo de transação imobiliária (para filtros - inclui vazio) */
export type TransactionTypeFilter = "venda" | "aluguel" | ""

/** Tipo de transação de um imóvel (sem vazio) */
export type TransactionType = "venda" | "aluguel"

/** Tipo de imóvel (para filtros - inclui vazio) */
export type PropertyTypeFilter = "apartamento" | "casa" | "cobertura" | "sala_comercial" | ""

/** Tipo de imóvel disponível */
export type PropertyType = "apartamento" | "casa" | "cobertura" | "sala_comercial"

/** Quantidade de quartos em string para filtros (inclui vazio para "qualquer") */
export type BedroomCountFilter = "1" | "2" | "3" | "4" | ""

/** Quantidade de vagas em string para filtros (inclui vazio para "qualquer") */
export type ParkingSpacesCountFilter = "1" | "2" | "3" | ""

// ============= INTERFACES =============

/**
 * Interface completa de um imóvel
 * @description Contém todas as informações de uma propriedade imobiliária
 */
export interface Property {
  /** ID único do imóvel */
  id: string
  /** Slug para URL amigável */
  slug: string
  /** Título do imóvel */
  title: string
  /** Tipo de imóvel */
  type: PropertyType
  /** Tipo de transação */
  transactionType: TransactionType
  /** Endereço completo */
  address: string
  /** Bairro */
  neighborhood: string
  /** Valor do imóvel */
  price: number
  /** Taxa de condomínio (opcional) */
  condominiumFee?: number
  /** IPTU (opcional) */
  iptu?: number
  /** Área privativa em m² */
  privateArea: number
  /** Área total em m² (opcional) */
  totalArea?: number
  /** Número de quartos */
  bedrooms: number
  /** Número de suítes (opcional) */
  suites?: number
  /** Número de banheiros */
  bathrooms: number
  /** Número de vagas de garagem */
  parkingSpaces: number
  /** URLs das imagens do imóvel */
  images: string[]
  /** Descrição detalhada (opcional) */
  description?: string
  /** Lista de comodidades (opcional) */
  amenities?: string[]
  /** Se é destaque (opcional) */
  featured?: boolean
  /** Aceita animais de estimação (opcional) */
  acceptsPets?: boolean
  /** Orientação solar (opcional) */
  solarOrientation?: string
}

/**
 * Estado de filtros para busca de imóveis com type safety
 * @description Contém todos os filtros aplicáveis na listagem de propriedades
 */
export interface FilterState {
  /** Texto de busca livre */
  search: string
  /** Tipo de transação selecionado */
  transactionType: TransactionTypeFilter
  /** Tipo de imóvel selecionado */
  propertyType: PropertyTypeFilter
  /** Bairro para filtro */
  neighborhood: string
  /** Preço mínimo */
  minPrice: number
  /** Preço máximo */
  maxPrice: number
  /** Número de quartos */
  bedrooms: BedroomCountFilter
  /** Número de vagas */
  parkingSpaces: ParkingSpacesCountFilter
}

/**
 * Props para componentes de cartão de propriedade
 * @description Interface para propriedades do componente PropertyCard
 */
export interface PropertyCardProps {
  /** Dados do imóvel a ser exibido */
  property: Property
}
