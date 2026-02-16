import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active'],
    group: 'CRM',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: ({ req, id }) => {
      if (req.user?.role === 'admin') return true
      return req.user?.id === id
    },
    delete: isAdmin,
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome Completo',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Corretor', value: 'agent' },
        { label: 'Assistente', value: 'assistant' },
      ],
      saveToJWT: true,
      label: 'Função',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefone',
    },
    {
      name: 'creci',
      type: 'text',
      label: 'CRECI',
      admin: {
        condition: (data) => data?.role === 'agent',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografia/Sobre',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto de Perfil',
    },
    {
      name: 'commissionRate',
      type: 'number',
      min: 0,
      max: 100,
      label: 'Taxa de Comissão (%)',
      defaultValue: 0,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
