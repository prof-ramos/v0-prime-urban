import fs from 'node:fs/promises'
import path from 'node:path'
import { test as setup, expect } from '@playwright/test'
import { AdminLoginPage } from '../pages/admin-login.page'

const AUTH_PATH = path.resolve('e2e/.auth/admin.json')

setup('persist admin authentication state', async ({ page, baseURL }) => {
  await fs.mkdir(path.dirname(AUTH_PATH), { recursive: true })

  const email = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD

  if (!email || !password) {
    const anonymousState = { cookies: [], origins: [] }
    await fs.writeFile(AUTH_PATH, JSON.stringify(anonymousState, null, 2), 'utf-8')
    setup.info().annotations.push({
      type: 'warning',
      description: 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD não definidos. Estado autenticado foi pulado.',
    })
    return
  }

  const loginPage = new AdminLoginPage(page)
  await loginPage.goto(baseURL)
  await loginPage.login(email, password)

  await expect(page).toHaveURL(/\/admin(\/collections.*)?$/)
  await page.context().storageState({ path: AUTH_PATH })
})
