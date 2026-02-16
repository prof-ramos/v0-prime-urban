const BRAZILIAN_PHONE_DIGITS_REGEX = /^\d{10,11}$/
const CRECI_SUFFIX_REGEX = /^\d{2,6}[-/]?[A-Z]{2}$/
const CRECI_PREFIX_REGEX = /^[A-Z]{2}[-/]?\d{2,6}$/

const toStringValue = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

const stripNonDigits = (value: string): string => value.replace(/\D/g, '')

export const normalizeBrazilianPhone = (phone: string): string => {
  const digits = stripNonDigits(phone)
  if (digits.startsWith('55') && digits.length > 11) {
    return digits.slice(2)
  }
  return digits
}

export const validateBrazilianPhone = (value: unknown): true | string => {
  const raw = toStringValue(value)
  if (!raw || raw.trim() === '') return true

  const normalized = normalizeBrazilianPhone(raw)
  if (!BRAZILIAN_PHONE_DIGITS_REGEX.test(normalized)) {
    return 'Telefone deve conter DDD + número, com 10 ou 11 dígitos.'
  }

  return true
}

export const normalizeCreci = (creci: string): string => creci.trim().toUpperCase().replace(/\s+/g, '')

export const validateCreci = (value: unknown): true | string => {
  const raw = toStringValue(value)
  if (!raw || raw.trim() === '') return true

  const normalized = normalizeCreci(raw)
  if (!CRECI_SUFFIX_REGEX.test(normalized) && !CRECI_PREFIX_REGEX.test(normalized)) {
    return 'CRECI inválido. Use formato UF12345, UF-12345, 12345UF ou 12345-UF.'
  }

  return true
}
