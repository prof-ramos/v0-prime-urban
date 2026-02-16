import type { Property } from "./types"
import { getFeaturedProperties as getFeaturedPropertiesFromMock, getPropertyBySlug as getPropertyBySlugFromMock, mockProperties } from "./mock-data"

/**
 * Camada de acesso a dados da aplicação.
 * Atualmente usa dataset local mockado.
 */
export async function getProperties(): Promise<Property[]> {
  return mockProperties
}

/**
 * Busca um imóvel por slug
 * @param slug - URL slug do imóvel
 * @returns Propriedade ou null se não encontrado
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  return getPropertyBySlugFromMock(slug) ?? null
}

/**
 * Busca imóveis em destaque
 * @returns Array de propriedades marcadas como destaque
 */
export async function getFeaturedProperties(): Promise<Property[]> {
  return getFeaturedPropertiesFromMock()
}

/**
 * Busca slugs de todos os imóveis para geração de rotas estáticas
 * @returns Array de slugs para generateStaticParams
 */
export async function getPropertySlugs(): Promise<Array<{ slug: string }>> {
  return mockProperties.map((property) => ({
    slug: property.slug,
  }))
}
