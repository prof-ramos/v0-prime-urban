import type { CollectionConfig } from 'payload'
import { autoSlug } from '../hooks/beforeChange/auto-slug'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'propertyCount', 'averagePrice', 'active'],
    group: 'Imobiliário',
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [autoSlug('name')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Nome do Bairro',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      defaultValue: 'Brasília',
      label: 'Cidade',
    },
    {
      name: 'state',
      type: 'select',
      required: true,
      defaultValue: 'DF',
      label: 'Estado',
      admin: {
        width: '30%',
      },
      options: [
        { label: 'Acre', value: 'AC' },
        { label: 'Alagoas', value: 'AL' },
        { label: 'Amapá', value: 'AP' },
        { label: 'Amazonas', value: 'AM' },
        { label: 'Bahia', value: 'BA' },
        { label: 'Ceará', value: 'CE' },
        { label: 'Distrito Federal', value: 'DF' },
        { label: 'Espírito Santo', value: 'ES' },
        { label: 'Goiás', value: 'GO' },
        { label: 'Maranhão', value: 'MA' },
        { label: 'Mato Grosso', value: 'MT' },
        { label: 'Mato Grosso do Sul', value: 'MS' },
        { label: 'Minas Gerais', value: 'MG' },
        { label: 'Pará', value: 'PA' },
        { label: 'Paraíba', value: 'PB' },
        { label: 'Paraná', value: 'PR' },
        { label: 'Pernambuco', value: 'PE' },
        { label: 'Piauí', value: 'PI' },
        { label: 'Rio de Janeiro', value: 'RJ' },
        { label: 'Rio Grande do Norte', value: 'RN' },
        { label: 'Rio Grande do Sul', value: 'RS' },
        { label: 'Rondônia', value: 'RO' },
        { label: 'Roraima', value: 'RR' },
        { label: 'Santa Catarina', value: 'SC' },
        { label: 'São Paulo', value: 'SP' },
        { label: 'Sergipe', value: 'SE' },
        { label: 'Tocantins', value: 'TO' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Descrição do Bairro',
      admin: {
        description: 'Informações sobre infraestrutura, comércio, transporte',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem Destaque',
    },
    {
      name: 'propertyCount',
      type: 'number',
      defaultValue: 0,
      label: 'Total de Imóveis Ativos',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'averagePrice',
      type: 'number',
      defaultValue: 0,
      label: 'Preço Médio (R$)',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
      admin: {
        position: 'sidebar',
        description: 'Exibir nos filtros do site',
      },
    },
  ],
}
