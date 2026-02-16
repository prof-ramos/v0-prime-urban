import { expect, type Locator, type Page } from '@playwright/test'

export class PropertiesPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly resultCounter: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder('Buscar por endereço, bairro ou código...')
    this.resultCounter = page.locator('p', { hasText: 'imóveis encontrados' })
  }

  async goto() {
    await this.page.goto('/imoveis')
    await expect(this.page.getByRole('heading', { name: 'Imóveis em Brasília' })).toBeVisible()
  }

  async search(term: string) {
    await this.searchInput.fill(term)
  }

  async expectResultCount(text: string) {
    await expect(this.page.getByText(text, { exact: false })).toBeVisible()
  }

  async openSortAndSelect(optionLabel: string) {
    await this.page.getByRole('combobox', { name: /ordenar por/i }).click()
    await this.page.getByRole('option', { name: optionLabel }).click()
  }

  async openFirstProperty() {
    await this.page.getByRole('link', { name: /Ver detalhes/i }).first().click()
  }
}
