import { expect, type Locator, type Page } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly header: Locator
  readonly featuredSectionTitle: Locator
  readonly featuredCards: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.getByRole('banner')
    this.featuredSectionTitle = page.getByRole('heading', { name: 'Imóveis em Destaque' })
    this.featuredCards = page.locator('article').filter({ has: page.getByRole('link', { name: 'Ver detalhes' }) })
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.page).toHaveTitle(/PrimeUrban/i)
  }

  async openDesktopNav(label: string) {
    await this.header.getByRole('link', { name: label }).first().click()
  }

  async assertMainSectionsVisible() {
    await expect(this.page.getByRole('heading', { name: /Encontre seu imóvel/i })).toBeVisible()
    await expect(this.featuredSectionTitle).toBeVisible()
    await expect(this.page.getByRole('heading', { name: /Bairros mais procurados/i })).toBeVisible()
  }
}
