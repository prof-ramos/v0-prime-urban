import { test, expect } from '../fixtures/base.fixture'

test.describe('Fluxos públicos - Home', () => {
  test('deve renderizar seções principais e navegar para listagem', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.assertMainSectionsVisible()

    await homePage.openDesktopNav('Imóveis')
    await expect(page).toHaveURL(/\/imoveis$/)
  })

  test('deve abrir/fechar menu mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const openButton = page.getByRole('button', { name: 'Abrir menu' })
    await openButton.click()
    await expect(page.getByRole('navigation', { name: 'Menu de navegação mobile' })).toBeVisible()

    await page.getByRole('button', { name: 'Fechar menu' }).click()
    await expect(page.getByRole('navigation', { name: 'Menu de navegação mobile' })).toBeHidden()
  })
})
