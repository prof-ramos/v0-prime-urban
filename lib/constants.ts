// Configurações de contato WhatsApp
export const WHATSAPP_CONFIG = {
  NUMBER: "5561999999999",
  DEFAULT_MESSAGE: "Olá! Gostaria de mais informações sobre imóveis em Brasília.",
} as const

// Labels de tipos de imóveis
export const PROPERTY_TYPE_LABELS = {
  apartamento: "Apartamento",
  casa: "Casa",
  cobertura: "Cobertura",
  sala_comercial: "Sala Comercial",
} as const

// Combine iterations: Build both index map and options array in a single pass
const _propertyTypeLabelIndexMap = new Map<string, keyof typeof PROPERTY_TYPE_LABELS>()
export const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(
  ([value, label]) => {
    // Populate reverse lookup map during the same iteration
    _propertyTypeLabelIndexMap.set(label, value as keyof typeof PROPERTY_TYPE_LABELS)
    return { value, label }
  }
) as const

/**
 * Get property type key by label with O(1) reverse lookup
 * @param label - The display label (e.g., "Apartamento")
 * @returns Property type key or undefined if not found
 */
export const getPropertyTypeByLabel = (label: string) => _propertyTypeLabelIndexMap.get(label)

// Lista unificada de bairros (com estrutura compatível para todos os casos de uso)
export const NEIGHBORHOODS = [
  { value: "asa-sul", label: "Asa Sul", name: "Asa Sul", description: "Coração político e administrativo de Brasília" },
  { value: "asa-norte", label: "Asa Norte", name: "Asa Norte", description: "Bairro residencial com excelente infraestrutura" },
  { value: "aguas-claras", label: "Águas Claras", name: "Águas Claras", description: "Moderno bairro com skyline vertical" },
  { value: "sudoeste", label: "Sudoeste", name: "Sudoeste", description: "Bairro nobre com comércio de alto padrão" },
  { value: "noroeste", label: "Noroeste", name: "Noroeste", description: "Área residencial em expansão" },
  { value: "lago-sul", label: "Lago Sul", name: "Lago Sul", description: "Bairro lacustre de alto padrão" },
  { value: "lago-norte", label: "Lago Norte", name: "Lago Norte", description: "Bairro lacustre com estilo de vida único" },
  { value: "guara", label: "Guará", name: "Guará", description: "Bairro tradicional com bom custo-benefício" },
] as const

// Index map for O(1) neighborhood lookups by value
const _neighborhoodIndexMap = new Map<string, (typeof NEIGHBORHOODS)[number]>()
NEIGHBORHOODS.forEach((n) => _neighborhoodIndexMap.set(n.value, n))

/**
 * Get neighborhood data by value with O(1) lookup
 * @param value - The neighborhood value (e.g., "asa-sul")
 * @returns Neighborhood object or undefined if not found
 */
export const getNeighborhoodByValue = (value: string) => _neighborhoodIndexMap.get(value)

// Magic numbers
export const PRICE_LIMITS = {
  MIN: 0,
  MAX: 10_000_000, // 10 milhões BRL
} as const
