import type { CollectionAfterChangeHook } from 'payload'

import { sendEmail } from '../../../lib/resend'
import type { Property } from '../../payload-types'

export const notifyInterestedLeads: CollectionAfterChangeHook<Property> = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  // Apenas quando o status muda para publicado
  if (operation === 'update') {
    const isPublished = doc.status === 'published'
    const wasPublished = previousDoc?.status === 'published'

    if (isPublished && !wasPublished) {
      req.payload.logger.info(`Notifying interested leads for property ${doc.code}`)

      try {
        // Buscar leads qualificados para notificar
        const interestedLeads = await req.payload.find({
          collection: 'leads',
          where: {
            status: { in: ['new', 'qualified'] },
            email: { exists: true },
          },
          limit: 100,
        })

        const leadsWithEmail = interestedLeads.docs.filter((lead) => Boolean(lead.email))
        const results = await Promise.allSettled(
          leadsWithEmail.map((lead) =>
            sendEmail({
              to: lead.email as string,
              subject: `Nova Oportunidade: ${doc.title}`,
              html: `
                <h1>Imóvel Publicado!</h1>
                <p>Olá ${lead.name}, um novo imóvel que pode te interessar acaba de ser publicado.</p>
                <h2>${doc.title}</h2>
                <p>${doc.shortDescription}</p>
                <p><strong>Preço:</strong> ${
                  typeof doc.price === 'number' ? `R$ ${doc.price.toLocaleString('pt-BR')}` : '—'
                }</p>
                <p><a href="${process.env.NEXT_PUBLIC_SERVER_URL}/imoveis/${doc.slug}">Ver Detalhes do Imóvel</a></p>
              `,
            })
          )
        )

        const failedSends = results.filter((result) => result.status === 'rejected')
        if (failedSends.length > 0) {
          req.payload.logger.warn({
            msg: 'Falha parcial ao notificar leads interessados',
            propertyCode: doc.code,
            total: leadsWithEmail.length,
            failed: failedSends.length,
          })
        }
      } catch (error: unknown) {
        req.payload.logger.error({
          msg: 'Erro ao notificar leads interessados',
          propertyCode: doc.code,
          err: error,
        })
      }
    }
  }
  return doc
}
