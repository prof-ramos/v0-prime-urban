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

// Magic numbers
export const PRICE_LIMITS = {
  MIN: 0,
  MAX: 10_000_000, // 10 milhões BRL
} as const
