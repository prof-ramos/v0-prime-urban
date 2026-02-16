import type { CollectionBeforeChangeHook } from 'payload'
import slugify from 'slugify'

export const autoSlug =
  (field: string): CollectionBeforeChangeHook =>
  async ({ data, operation }) => {
    if (!data) return data

    if ((operation === 'create' || operation === 'update') && !data.slug) {
      const fieldValue = data[field]
      if (typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
        data.slug = slugify(fieldValue, {
          lower: true,
          locale: 'pt',
          strict: true,
        })
      }
    }
    return data
  }
