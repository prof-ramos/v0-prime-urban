import { test, expect } from '../fixtures/base.fixture'

test.describe('Fluxos públicos - Listagem de imóveis', () => {
  test('deve filtrar por termo de busca', async ({ propertiesPage, page }) => {
    await propertiesPage.goto()
    await propertiesPage.search('Águas Claras')

    await propertiesPage.expectResultCount('1 imóvel encontrado')
    await expect(page.getByText('Apartamento moderno 3 quartos em Águas Claras')).toBeVisible()
  })

  test('deve mostrar empty-state ao buscar termo inexistente', async ({ propertiesPage, page }) => {
    await propertiesPage.goto()
    await propertiesPage.search('setor inexistente xyz')

    await expect(page.getByRole('heading', { name: 'Nenhum imóvel encontrado' })).toBeVisible()
  })

  test('deve abrir detalhes do primeiro imóvel e enviar formulário de contato', async ({
    propertiesPage,
    propertyDetailsPage,
    page,
  }) => {
    await propertiesPage.goto()
    await propertiesPage.openFirstProperty()

    await expect(page).toHaveURL(/\/imoveis\//)
    await expect(page.getByRole('heading', { level: 2, name: 'Descrição' })).toBeVisible()

    await propertyDetailsPage.fillContactForm({
      name: 'Cliente de Teste',
      email: 'cliente.teste@primeurban.com',
      phone: '(61) 97777-6666',
      message: 'Tenho interesse e gostaria de agendar uma visita.',
    })
    await propertyDetailsPage.submitContact()
  })
})
