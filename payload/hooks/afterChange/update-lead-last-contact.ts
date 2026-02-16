import type { CollectionAfterChangeHook } from 'payload'

interface ActivityDoc {
  id?: number | string
  lead?: string | number | { id: string | number }
}

export const updateLeadLastContact: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation !== 'create') return doc

  const activity = doc as ActivityDoc

  if (activity.lead) {
    const leadId = typeof activity.lead === 'object' ? activity.lead.id : activity.lead

    try {
      await req.payload.update({
        collection: 'leads',
        id: leadId,
        data: {
          lastContactAt: new Date().toISOString(),
        },
        context: {
          internalUpdate: true,
        },
      })
    } catch (error: unknown) {
      req.payload.logger.error({
        msg: 'Erro ao atualizar lastContactAt do lead',
        activityId: activity.id,
        leadId,
        err: error,
      })
    }
  }

  return doc
}
