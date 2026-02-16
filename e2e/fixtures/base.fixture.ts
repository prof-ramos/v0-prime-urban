import { test as base, expect } from '@playwright/test'
import { HomePage } from '../pages/home.page'
import { PropertiesPage } from '../pages/properties.page'
import { PropertyDetailsPage } from '../pages/property-details.page'

type AppFixtures = {
  homePage: HomePage
  propertiesPage: PropertiesPage
  propertyDetailsPage: PropertyDetailsPage
}

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, runFixture) => {
    await runFixture(new HomePage(page))
  },
  propertiesPage: async ({ page }, runFixture) => {
    await runFixture(new PropertiesPage(page))
  },
  propertyDetailsPage: async ({ page }, runFixture) => {
    await runFixture(new PropertyDetailsPage(page))
  },
})

export { expect }
