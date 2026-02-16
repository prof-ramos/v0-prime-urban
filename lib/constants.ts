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
)

/**
 * Get property type key by label with O(1) reverse lookup
 * @param label - The display label (e.g., "Apartamento")
 * @returns Property type key or undefined if not found
 */
export const getPropertyTypeByLabel = (label: string) => _propertyTypeLabelIndexMap.get(label)

// =============================================
// REGIÕES ADMINISTRATIVAS DO DF (35 RAs)
// =============================================
export const NEIGHBORHOODS_DF = [
  { value: "plano-piloto", label: "Plano Piloto", name: "Plano Piloto", description: "Centro político e administrativo da capital", region: "DF" as const },
  { value: "gama", label: "Gama", name: "Gama", description: "Cidade-satélite tradicional com forte comércio", region: "DF" as const },
  { value: "taguatinga", label: "Taguatinga", name: "Taguatinga", description: "Polo comercial consolidado do DF", region: "DF" as const },
  { value: "brazlandia", label: "Brazlândia", name: "Brazlândia", description: "Região rural com festas tradicionais", region: "DF" as const },
  { value: "sobradinho", label: "Sobradinho", name: "Sobradinho", description: "Cidade-satélite com clima interiorano", region: "DF" as const },
  { value: "planaltina", label: "Planaltina", name: "Planaltina", description: "Uma das cidades mais antigas da região", region: "DF" as const },
  { value: "paranoa", label: "Paranoá", name: "Paranoá", description: "Próxima ao Lago Paranoá e natureza exuberante", region: "DF" as const },
  { value: "nucleo-bandeirante", label: "Núcleo Bandeirante", name: "Núcleo Bandeirante", description: "Cidade livre histórica de Brasília", region: "DF" as const },
  { value: "ceilandia", label: "Ceilândia", name: "Ceilândia", description: "Maior região administrativa do DF", region: "DF" as const },
  { value: "guara", label: "Guará", name: "Guará", description: "Bairro tradicional com bom custo-benefício", region: "DF" as const },
  { value: "cruzeiro", label: "Cruzeiro", name: "Cruzeiro", description: "Região central próxima ao Plano Piloto", region: "DF" as const },
  { value: "samambaia", label: "Samambaia", name: "Samambaia", description: "Região em crescimento com parques urbanos", region: "DF" as const },
  { value: "santa-maria", label: "Santa Maria", name: "Santa Maria", description: "Cidade-satélite residencial ao sul do DF", region: "DF" as const },
  { value: "sao-sebastiao", label: "São Sebastião", name: "São Sebastião", description: "Região próxima a áreas de preservação", region: "DF" as const },
  { value: "recanto-das-emas", label: "Recanto das Emas", name: "Recanto das Emas", description: "Comunidade residencial em desenvolvimento", region: "DF" as const },
  { value: "lago-sul", label: "Lago Sul", name: "Lago Sul", description: "Bairro lacustre de alto padrão", region: "DF" as const },
  { value: "riacho-fundo", label: "Riacho Fundo", name: "Riacho Fundo", description: "Região residencial próxima ao Guará", region: "DF" as const },
  { value: "lago-norte", label: "Lago Norte", name: "Lago Norte", description: "Bairro lacustre com estilo de vida único", region: "DF" as const },
  { value: "candangolandia", label: "Candangolândia", name: "Candangolândia", description: "Primeira vila operária de Brasília", region: "DF" as const },
  { value: "aguas-claras", label: "Águas Claras", name: "Águas Claras", description: "Moderno bairro com skyline vertical", region: "DF" as const },
  { value: "riacho-fundo-ii", label: "Riacho Fundo II", name: "Riacho Fundo II", description: "Extensão residencial do Riacho Fundo", region: "DF" as const },
  { value: "sudoeste-octogonal", label: "Sudoeste/Octogonal", name: "Sudoeste/Octogonal", description: "Bairro nobre com comércio de alto padrão", region: "DF" as const },
  { value: "varjao", label: "Varjão", name: "Varjão", description: "Comunidade próxima ao Lago Norte", region: "DF" as const },
  { value: "park-way", label: "Park Way", name: "Park Way", description: "Região de chácaras e lotes generosos", region: "DF" as const },
  { value: "scia-estrutural", label: "SCIA (Estrutural)", name: "SCIA (Estrutural)", description: "Região em processo de urbanização", region: "DF" as const },
  { value: "sobradinho-ii", label: "Sobradinho II", name: "Sobradinho II", description: "Extensão residencial de Sobradinho", region: "DF" as const },
  { value: "jardim-botanico", label: "Jardim Botânico", name: "Jardim Botânico", description: "Condomínios cercados por natureza", region: "DF" as const },
  { value: "itapoa", label: "Itapoã", name: "Itapoã", description: "Comunidade próxima ao Paranoá", region: "DF" as const },
  { value: "sia", label: "SIA", name: "SIA", description: "Setor de Indústria e Abastecimento", region: "DF" as const },
  { value: "vicente-pires", label: "Vicente Pires", name: "Vicente Pires", description: "Região residencial em expansão", region: "DF" as const },
  { value: "fercal", label: "Fercal", name: "Fercal", description: "Região com vocação rural e industrial", region: "DF" as const },
  { value: "sol-nascente-por-do-sol", label: "Sol Nascente/Pôr do Sol", name: "Sol Nascente/Pôr do Sol", description: "Uma das maiores comunidades do DF", region: "DF" as const },
  { value: "arniqueira", label: "Arniqueira", name: "Arniqueira", description: "Região residencial próxima a Águas Claras", region: "DF" as const },
  { value: "arapoanga", label: "Arapoanga", name: "Arapoanga", description: "Comunidade em desenvolvimento em Planaltina", region: "DF" as const },
  { value: "agua-quente", label: "Água Quente", name: "Água Quente", description: "Região administrativa mais recente do DF", region: "DF" as const },
] as const

// =============================================
// RIDE - Municípios de Goiás (33)
// =============================================
export const NEIGHBORHOODS_GO = [
  { value: "abadiania-go", label: "Abadiânia", name: "Abadiânia", description: "Município goiano do entorno do DF", region: "GO" as const },
  { value: "agua-fria-de-goias", label: "Água Fria de Goiás", name: "Água Fria de Goiás", description: "Município goiano do entorno do DF", region: "GO" as const },
  { value: "aguas-lindas-de-goias", label: "Águas Lindas de Goiás", name: "Águas Lindas de Goiás", description: "Grande polo do entorno sul de Brasília", region: "GO" as const },
  { value: "alexandria-go", label: "Alexânia", name: "Alexânia", description: "Município goiano no eixo Brasília-Goiânia", region: "GO" as const },
  { value: "alto-paraiso-de-goias", label: "Alto Paraíso de Goiás", name: "Alto Paraíso de Goiás", description: "Portal da Chapada dos Veadeiros", region: "GO" as const },
  { value: "alvorada-do-norte", label: "Alvorada do Norte", name: "Alvorada do Norte", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "barro-alto-go", label: "Barro Alto", name: "Barro Alto", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "cabeceiras-go", label: "Cabeceiras", name: "Cabeceiras", description: "Município goiano do entorno do DF", region: "GO" as const },
  { value: "cavalcante-go", label: "Cavalcante", name: "Cavalcante", description: "Município na Chapada dos Veadeiros", region: "GO" as const },
  { value: "cidade-ocidental", label: "Cidade Ocidental", name: "Cidade Ocidental", description: "Município do entorno imediato do DF", region: "GO" as const },
  { value: "cocalzinho-de-goias", label: "Cocalzinho de Goiás", name: "Cocalzinho de Goiás", description: "Município goiano do entorno do DF", region: "GO" as const },
  { value: "corumba-de-goias", label: "Corumbá de Goiás", name: "Corumbá de Goiás", description: "Município turístico de Goiás", region: "GO" as const },
  { value: "cristalina-go", label: "Cristalina", name: "Cristalina", description: "Polo de cristais e agronegócio", region: "GO" as const },
  { value: "flores-de-goias", label: "Flores de Goiás", name: "Flores de Goiás", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "formosa-go", label: "Formosa", name: "Formosa", description: "Importante cidade do entorno do DF", region: "GO" as const },
  { value: "goianesia-go", label: "Goianésia", name: "Goianésia", description: "Polo sucroalcooleiro de Goiás", region: "GO" as const },
  { value: "luziania-go", label: "Luziânia", name: "Luziânia", description: "Cidade histórica do entorno do DF", region: "GO" as const },
  { value: "mimoso-de-goias", label: "Mimoso de Goiás", name: "Mimoso de Goiás", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "niquelandia-go", label: "Niquelândia", name: "Niquelândia", description: "Polo de mineração em Goiás", region: "GO" as const },
  { value: "novo-gama", label: "Novo Gama", name: "Novo Gama", description: "Município do entorno imediato do DF", region: "GO" as const },
  { value: "padre-bernardo", label: "Padre Bernardo", name: "Padre Bernardo", description: "Município goiano do entorno do DF", region: "GO" as const },
  { value: "pirenopolis-go", label: "Pirenópolis", name: "Pirenópolis", description: "Cidade turística e histórica de Goiás", region: "GO" as const },
  { value: "planaltina-go", label: "Planaltina de Goiás", name: "Planaltina de Goiás", description: "Município do entorno imediato do DF", region: "GO" as const },
  { value: "santo-antonio-do-descoberto", label: "Santo Antônio do Descoberto", name: "Santo Antônio do Descoberto", description: "Município do entorno do DF", region: "GO" as const },
  { value: "sao-joao-d-alianca", label: "São João d'Aliança", name: "São João d'Aliança", description: "Município goiano da Chapada dos Veadeiros", region: "GO" as const },
  { value: "simolandia-go", label: "Simolândia", name: "Simolândia", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "valparaiso-de-goias", label: "Valparaíso de Goiás", name: "Valparaíso de Goiás", description: "Grande município do entorno sul do DF", region: "GO" as const },
  { value: "vila-boa-go", label: "Vila Boa", name: "Vila Boa", description: "Município goiano da RIDE", region: "GO" as const },
  { value: "vila-propicio-go", label: "Vila Propício", name: "Vila Propício", description: "Município goiano da RIDE", region: "GO" as const },
] as const

// =============================================
// RIDE - Municípios de Minas Gerais (4)
// =============================================
export const NEIGHBORHOODS_MG = [
  { value: "arinos-mg", label: "Arinos", name: "Arinos", description: "Município mineiro da RIDE", region: "MG" as const },
  { value: "buritis-mg", label: "Buritis", name: "Buritis", description: "Município mineiro da RIDE", region: "MG" as const },
  { value: "cabeceira-grande-mg", label: "Cabeceira Grande", name: "Cabeceira Grande", description: "Município mineiro da RIDE", region: "MG" as const },
  { value: "unai-mg", label: "Unaí", name: "Unaí", description: "Principal cidade do noroeste mineiro na RIDE", region: "MG" as const },
] as const

// Lista unificada de bairros (DF + RIDE)
export const NEIGHBORHOODS = [
  ...NEIGHBORHOODS_DF,
  ...NEIGHBORHOODS_GO,
  ...NEIGHBORHOODS_MG,
] as const

// Index map for O(1) neighborhood lookups by value
const _neighborhoodIndexMap = new Map<string, (typeof NEIGHBORHOODS)[number]>()
NEIGHBORHOODS.forEach((n) => _neighborhoodIndexMap.set(n.value, n))

/**
 * Get neighborhood data by value with O(1) lookup
 * @param value - The neighborhood value (e.g., "plano-piloto")
 * @returns Neighborhood object or undefined if not found
 */
export const getNeighborhoodByValue = (value: string) => _neighborhoodIndexMap.get(value)

// Magic numbers
export const PRICE_LIMITS = {
  MIN: 0,
  MAX: 10_000_000, // 10 milhões BRL
} as const
