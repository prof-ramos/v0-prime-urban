import type { CollectionBeforeChangeHook } from 'payload'

interface CodeData {
  code?: string
}

interface DocumentWithCode {
  code?: string
}

export const autoCode = (
  prefix: string,
  collectionSlug: string = 'properties',
): CollectionBeforeChangeHook => {
  return async ({ data, operation, req }) => {
    if (operation === 'create' && !data.code) {
      const lastDoc = await req.payload.find({
        collection: collectionSlug,
        sort: '-createdAt',
        limit: 1,
        where: {
          code: {
            like: `${prefix}-%`,
          },
        },
      })

      let nextNumber = 1
      if (lastDoc.docs.length > 0) {
        const docWithCode = lastDoc.docs[0] as unknown as DocumentWithCode
        const lastCode = docWithCode.code
        if (lastCode) {
          const matches = lastCode.match(/-(\d+)/)
          if (matches) {
            nextNumber = parseInt(matches[1]) + 1
          }
        }
      }
      ;(data as CodeData).code = `${prefix}-${String(nextNumber).padStart(3, '0')}`
    }
    return data
  }
}
