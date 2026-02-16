import { type Page } from '@playwright/test'

export class AdminLoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(baseURL?: string) {
    await this.page.goto(`${baseURL ?? ''}/admin`)
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email)
    await this.page.getByLabel(/password/i).fill(password)
    await this.page.getByRole('button', { name: /entrar|sign in|login/i }).click()
  }
}
