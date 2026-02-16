import { expect, type Page } from '@playwright/test'

export class PropertyDetailsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillContactForm(data: { name: string; email: string; phone: string; message: string }) {
    await this.page.getByLabel('Nome completo').fill(data.name)
    await this.page.getByLabel('E-mail').fill(data.email)
    await this.page.getByLabel('Telefone').fill(data.phone)
    await this.page.getByLabel('Mensagem').fill(data.message)
  }

  async submitContact() {
    await this.page.getByRole('button', { name: 'Enviar mensagem' }).click()
    await expect(this.page.getByRole('heading', { name: 'Mensagem enviada!' })).toBeVisible()
  }
}
