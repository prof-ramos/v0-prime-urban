import type { Property } from "@/lib/types"

export const mockProperties: Property[] = [
  {
    id: "1",
    slug: "apartamento-asa-sul-sqn-308",
    title: "Apartamento 4 quartos com vista para o Parque da Cidade",
    type: "apartamento",
    transactionType: "venda",
    price: 1850000,
    condominiumFee: 1800,
    iptu: 650,
    neighborhood: "Asa Sul",
    address: "SQS 308, Bloco A",
    privateArea: 180,
    totalArea: 210,
    bedrooms: 4,
    suites: 2,
    bathrooms: 3,
    parkingSpaces: 2,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
    featured: true,
    acceptsPets: true,
    solarOrientation: "Nascente",
  },
  {
    id: "2",
    slug: "cobertura-noroeste-sqnw-111",
    title: "Cobertura duplex com terraço gourmet no Noroeste",
    type: "cobertura",
    transactionType: "venda",
    price: 3200000,
    condominiumFee: 2500,
    iptu: 1200,
    neighborhood: "Noroeste",
    address: "SQNW 111, Bloco B",
    privateArea: 320,
    totalArea: 380,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"],
    featured: true,
    acceptsPets: true,
    solarOrientation: "Poente",
  },
  {
    id: "3",
    slug: "apartamento-aguas-claras-rua-37",
    title: "Apartamento moderno 3 quartos em Águas Claras",
    type: "apartamento",
    transactionType: "aluguel",
    price: 4500,
    condominiumFee: 800,
    iptu: 200,
    neighborhood: "Águas Claras",
    address: "Rua 37 Norte, Lote 12",
    privateArea: 95,
    totalArea: 110,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 2,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
    featured: false,
    acceptsPets: true,
    solarOrientation: "Nascente",
  },
  {
    id: "4",
    slug: "casa-lago-sul-shis-qi-25",
    title: "Casa de alto padrão com piscina no Lago Sul",
    type: "casa",
    transactionType: "venda",
    price: 8500000,
    condominiumFee: 0,
    iptu: 3500,
    neighborhood: "Lago Sul",
    address: "SHIS QI 25, Conjunto 8",
    privateArea: 550,
    totalArea: 1200,
    bedrooms: 5,
    suites: 5,
    bathrooms: 7,
    parkingSpaces: 6,
    images: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"],
    featured: true,
    acceptsPets: true,
    solarOrientation: "Norte/Sul",
  },
  {
    id: "5",
    slug: "apartamento-sudoeste-sqsw-300",
    title: "Apartamento reformado 2 quartos no Sudoeste",
    type: "apartamento",
    transactionType: "aluguel",
    price: 3800,
    condominiumFee: 950,
    iptu: 280,
    neighborhood: "Sudoeste",
    address: "SQSW 300, Bloco C",
    privateArea: 75,
    totalArea: 85,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 1,
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80"],
    featured: false,
    acceptsPets: false,
    solarOrientation: "Poente",
  },
  {
    id: "6",
    slug: "apartamento-asa-norte-sqs-405",
    title: "Apartamento amplo 3 quartos próximo ao Parque Olhos D'água",
    type: "apartamento",
    transactionType: "venda",
    price: 1450000,
    condominiumFee: 1400,
    iptu: 520,
    neighborhood: "Asa Norte",
    address: "SQN 405, Bloco D",
    privateArea: 140,
    totalArea: 165,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 2,
    images: ["https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80"],
    featured: false,
    acceptsPets: true,
    solarOrientation: "Nascente",
  },
]

// Cache featured properties to avoid filtering on every call
let _featuredProperties: Property[] | null = null
export const getFeaturedProperties = () => {
  if (_featuredProperties === null) {
    _featuredProperties = mockProperties.filter((p) => p.featured)
  }
  return _featuredProperties
}

// Cache property lookups by slug
const _propertyCache = new Map<string, Property>()
export const getPropertyBySlug = (slug: string) => {
  if (!_propertyCache.has(slug)) {
    const property = mockProperties.find((p) => p.slug === slug)
    if (property) {
      _propertyCache.set(slug, property)
    }
  }
  return _propertyCache.get(slug)
}
