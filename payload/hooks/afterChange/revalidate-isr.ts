import type { CollectionAfterChangeHook } from 'payload'
import type { Property } from '../../payload-types'

export const revalidateProperty: CollectionAfterChangeHook<Property> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  const { revalidatePath } = await import('next/cache')
  const published = doc.status === 'published'

  if (operation === 'create') {
    // Revalidar quando cria com status published
    if (published) {
      try {
        revalidatePath(`/imovel/${doc.slug}`)
        revalidatePath('/imoveis')
        revalidatePath('/')

        req.payload.logger.info(`ISR Revalidated for new property: ${doc.slug}`)
      } catch (error) {
        req.payload.logger.error(`Error revalidating ISR: ${error}`)
      }
    }
  } else if (operation === 'update') {
    const statusChanged = previousDoc?.status !== doc.status
    const slugChanged = previousDoc?.slug !== doc.slug

    if (statusChanged) {
      // Caso 1: Unpublish (de published para outro status)
      if (previousDoc?.status === 'published' && !published && previousDoc?.slug) {
        try {
          revalidatePath(`/imovel/${previousDoc.slug}`)
          revalidatePath('/imoveis')
          revalidatePath('/')

          req.payload.logger.info(`ISR Revalidated for unpublished property: ${previousDoc.slug}`)
        } catch (error) {
          req.payload.logger.error(`Error revalidating ISR: ${error}`)
        }
      }
      // Caso 2: Publish (de outro status para published)
      else if (published) {
        try {
          revalidatePath(`/imovel/${doc.slug}`)
          revalidatePath('/imoveis')
          revalidatePath('/')

          req.payload.logger.info(`ISR Revalidated for published property: ${doc.slug}`)
        } catch (error) {
          req.payload.logger.error(`Error revalidating ISR: ${error}`)
        }
      }
    }

    // Caso 3: Slug mudou enquanto published
    if (slugChanged && published) {
      try {
        // Revalidar URL antiga e nova
        if (previousDoc?.slug) {
          revalidatePath(`/imovel/${previousDoc.slug}`)
        }
        revalidatePath(`/imovel/${doc.slug}`)
        revalidatePath('/imoveis')
        revalidatePath('/')

        req.payload.logger.info(`ISR Revalidated for slug change: ${previousDoc?.slug} -> ${doc.slug}`)
      } catch (error) {
        req.payload.logger.error(`Error revalidating ISR: ${error}`)
      }
    }
  }

  return doc
}
