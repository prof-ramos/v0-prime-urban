import type { CollectionAfterChangeHook } from 'payload'

export const notifyInterestedLeads: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // Apenas quando o status muda para publicado
  if (operation === 'update') {
    const isPublished = (doc as any).status === 'published'
    const wasPublished = previousDoc?.status === 'published'

    if (isPublished && !wasPublished) {
      req.payload.logger.info(
        `Notifying interested leads for property ${(doc as any).code} - (Stub Implementation)`
      )
      // Futuramente integrar com Resend/Email aqui
    }
  }
  return doc
}
