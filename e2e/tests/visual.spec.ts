import { test, expect } from '../fixtures/base.fixture'
import { visualViewports } from '../fixtures/test-data'

test.describe('Visual regression', () => {
  test('home desktop deve manter baseline visual', async ({ page, homePage }) => {
    await page.setViewportSize(visualViewports.desktop)
    await homePage.goto()

    await expect(page).toHaveScreenshot('home-desktop.png', {
      fullPage: true,
      mask: [page.locator('img[src*="unsplash.com"]')],
    })
  })

  test('listagem mobile deve manter baseline visual', async ({ page, propertiesPage }) => {
    await page.setViewportSize(visualViewports.mobile)
    await propertiesPage.goto()

    await expect(page).toHaveScreenshot('properties-mobile.png', {
      fullPage: true,
      mask: [page.locator('img[src*="unsplash.com"]')],
    })
  })
})
