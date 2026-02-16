import type { CollectionAfterChangeHook } from 'payload'

interface ActivityDoc {
  lead?: string | { id: string }
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
      })
    } catch (error) {
      // Logar erro mas não interromper o fluxo
      console.error('Erro ao atualizar lastContactAt do lead:', error)
    }
  }

  return doc
}
