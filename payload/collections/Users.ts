import { ValidationError, type Access, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

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

const validatePasswordStrength: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data || typeof data.password !== 'string') return data

  const password = data.password.trim()
  if (!password) return data

  const hasMinLength = password.length >= 8
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (!hasMinLength || !hasLetter || !hasNumber) {
    throw new ValidationError(
      {
        collection: 'users',
        errors: [
          {
            path: 'password',
            message: 'Senha deve ter ao menos 8 caracteres com letras e números.',
          },
        ],
        req,
      },
      req.t,
    )
  }

  return data
}

const readSelfOrAdmin: Access = ({ req, id }) => {
  if (isAdmin({ req })) return true
  if (!req.user) return false

  if (id === undefined || id === null) {
    return { id: { equals: req.user.id } }
  }

  return String(req.user.id) === String(id)
}

const isSelfOrAdmin: Access = ({ req, id }) => {
  if (isAdmin({ req })) return true
  if (!req.user || id === undefined || id === null) return false

  return String(req.user.id) === String(id)
}

const preventRoleChangeByNonAdmin: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data || operation !== 'update') return data
  if (req.user?.role === 'admin') return data

  if (typeof data.role === 'string' && data.role !== originalDoc?.role) {
    data.role = originalDoc?.role
  }

  return data
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
    read: readSelfOrAdmin,
    update: isSelfOrAdmin,
    delete: isAdmin,
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    minPasswordLength: 8,
    // In development/test we disable aggressive lockouts to keep automated suites deterministic.
    maxLoginAttempts: process.env.NODE_ENV === 'production' ? 5 : 1000,
    lockTime: process.env.NODE_ENV === 'production' ? 600000 : 1000, // 10 minutes in production
  },
  hooks: {
    beforeChange: [validatePasswordStrength, preventRoleChangeByNonAdmin, normalizeUserContactFields],
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
