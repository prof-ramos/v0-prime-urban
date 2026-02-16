import type { Access, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin } from '../access/is-admin'
import {
  normalizeBrazilianPhone,
  normalizeCreci,
  validateBrazilianPhone,
  validateCreci,
} from '../hooks/validators'

const normalizeUserContactFields: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  if (!data) return data

  if (typeof data.phone === 'string') {
    data.phone = normalizeBrazilianPhone(data.phone)
  }

  const resolvedRole =
    typeof data.role === 'string'
      ? data.role
      : typeof originalDoc?.role === 'string'
        ? originalDoc.role
        : undefined

  if (resolvedRole !== 'agent') {
    data.creci = null
    return data
  }

  if (typeof data.creci === 'string' && data.creci.trim().length > 0) {
    data.creci = normalizeCreci(data.creci)
  }

  return data
}

const isSelfOrAdmin: Access = ({ req, id }) => {
  if (isAdmin({ req })) return true
  if (!req.user || id === undefined || id === null) return false

  return String(req.user.id) === String(id)
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuário',
    plural: 'Usuários',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active'],
    group: 'Configurações',
  },
  access: {
    create: isAdmin,
    read: isSelfOrAdmin,
    update: isSelfOrAdmin,
    delete: isAdmin,
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  hooks: {
    beforeChange: [normalizeUserContactFields],
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
      validate: validateBrazilianPhone,
    },
    {
      name: 'creci',
      type: 'text',
      label: 'CRECI',
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { role?: string } } = {}
      ) => {
        if (siblingData?.role === 'agent') {
          const rawValue = typeof value === 'string' ? value.trim() : ''
          if (!rawValue) {
            return 'CRECI é obrigatório para usuários com função Corretor.'
          }
        }

        return validateCreci(value)
      },
      admin: {
        condition: (data) => data?.role === 'agent',
        description: 'Formato aceito: UF12345, UF-12345, 12345UF ou 12345-UF.',
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
