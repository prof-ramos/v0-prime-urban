import type { CollectionAfterChangeHook } from 'payload'

export const revalidateProperty: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  const published = doc.status === 'published'

  if (operation === 'create') {
    // Revalidar quando cria com status published
    if (published) {
      try {
        const { revalidatePath } = await import('next/cache')

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

    if (statusChanged && published) {
      try {
        const { revalidatePath } = await import('next/cache')

        revalidatePath(`/imovel/${doc.slug}`)
        revalidatePath('/imoveis')
        revalidatePath('/')

        req.payload.logger.info(`ISR Revalidated for property: ${doc.slug}`)
      } catch (error) {
        req.payload.logger.error(`Error revalidating ISR: ${error}`)
      }
    }
  }

  return doc
}
