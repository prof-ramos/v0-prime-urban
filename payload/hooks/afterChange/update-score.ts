import type { CollectionAfterChangeHook } from 'payload'
import type { Lead } from '../../payload-types'

interface LeadDocument extends Lead {
  score: number
}

export const updateLeadScore: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  // Prevenir loop infinito de atualizações internas
  if (req.context?.internalUpdate) return doc

  // Apenas para criação e atualização
  if (operation !== 'create' && operation !== 'update') return doc

  const lead = doc as LeadDocument
  let score = 0

  // Lógica de pontuação baseada em completude de dados
  if (lead.phone) score += 20
  if (lead.email) score += 20

  // Score máximo atual: phone (20) + email (20) = 40
  score = Math.max(0, Math.min(40, score))

  // Apenas atualiza se o score mudou
  if (lead.score !== score) {
    try {
      await req.payload.update({
        collection: 'leads',
        id: lead.id,
        data: {
          score,
        },
        context: {
          internalUpdate: true,
        },
      })
    } catch (error: unknown) {
      req.payload.logger.error({
        msg: 'Falha ao atualizar score do lead',
        leadId: lead.id,
        score,
        err: error,
      })
      // Não re-lança o erro para não travar a operação principal,
      // mas loga para monitoramento conforme solicitado.
    }
  }

  return doc
}
