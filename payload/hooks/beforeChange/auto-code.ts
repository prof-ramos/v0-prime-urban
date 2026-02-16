import type { CollectionBeforeChangeHook, Payload } from 'payload'

type AutoCodeCollection = 'properties' | 'leads'
type AutoCodeDoc = { code?: string | null }

const DEFAULT_CODE_PADDING = 3
const MAX_CODE_SCAN = 200
const MAX_COLLISION_CHECKS = 25

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getCodeFromUnknown = (doc: unknown): string | null => {
  if (!doc || typeof doc !== 'object') return null

  const code = (doc as AutoCodeDoc).code
  return typeof code === 'string' ? code : null
}

const getNumericSuffix = (code: string, normalizedPrefix: string): number | null => {
  const codeRegex = new RegExp(`^${escapeRegExp(normalizedPrefix)}-(\\d+)$`)
  const matches = code.match(codeRegex)
  if (!matches) return null

  const parsed = Number.parseInt(matches[1], 10)
  if (Number.isNaN(parsed) || parsed <= 0) return null

  return parsed
}

const formatCode = (prefix: string, index: number): string => {
  return `${prefix}-${String(index).padStart(DEFAULT_CODE_PADDING, '0')}`
}

const getNextCodeNumber = async ({
  collectionSlug,
  normalizedPrefix,
  payload,
}: {
  collectionSlug: AutoCodeCollection
  normalizedPrefix: string
  payload: Payload
}): Promise<number> => {
  const existingDocs = await payload.find({
    collection: collectionSlug,
    limit: MAX_CODE_SCAN,
    sort: '-code',
    where: {
      code: {
        like: `${normalizedPrefix}-%`,
      },
    },
  })

  const currentMax = existingDocs.docs.reduce((max, doc) => {
    const code = getCodeFromUnknown(doc)
    if (!code) return max

    const suffix = getNumericSuffix(code, normalizedPrefix)
    if (!suffix) return max

    return Math.max(max, suffix)
  }, 0)

  let nextNumber = currentMax + 1

  for (let attempt = 0; attempt < MAX_COLLISION_CHECKS; attempt += 1) {
    const candidate = formatCode(normalizedPrefix, nextNumber)
    const existingCandidate = await payload.find({
      collection: collectionSlug,
      limit: 1,
      where: {
        code: {
          equals: candidate,
        },
      },
    })

    if (existingCandidate.totalDocs === 0) {
      return nextNumber
    }

    nextNumber += 1
  }

  return nextNumber
}

export const autoCode = (
  prefix: string,
  collectionSlug: AutoCodeCollection = 'properties'
): CollectionBeforeChangeHook => {
  const normalizedPrefix = prefix.trim().toUpperCase()

  return async ({ data, operation, req }) => {
    if (!data || operation !== 'create') return data
    if (typeof data.code === 'string' && data.code.trim() !== '') return data
    if (!normalizedPrefix) return data

    const nextNumber = await getNextCodeNumber({
      collectionSlug,
      normalizedPrefix,
      payload: req.payload,
    })

    data.code = formatCode(normalizedPrefix, nextNumber)

    return data
  }
}
