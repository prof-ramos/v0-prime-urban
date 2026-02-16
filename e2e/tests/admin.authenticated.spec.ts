import { test, expect } from '@playwright/test'

test.describe('Fluxos autenticados - Admin Payload', () => {
  test('deve acessar área administrativa com storageState persistido', async ({ page }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      'Credenciais E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD não definidas.',
    )

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin(\/collections.*)?$/)
  })
})
