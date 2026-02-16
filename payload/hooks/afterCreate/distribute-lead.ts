import type { CollectionAfterChangeHook } from 'payload'

interface AgentDoc {
  id: string
}

interface LeadDoc {
  id: string
  assignedTo?: string | { id: string }
}

export const distributeLead: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  // Apenas na criação de um novo lead
  if (operation !== 'create') return doc

  // Encontrar corretores ativos com sort determinístico
  const agents = await req.payload.find({
    collection: 'users',
    sort: 'id',
    where: {
      and: [{ role: { equals: 'agent' } }, { active: { equals: true } }],
    },
  })

  if (agents.docs.length === 0) {
    req.payload.logger.warn('Nenhum corretor ativo para distribuir lead')
    return doc
  }

  // Encontrar o último lead atribuído para round-robin
  const lastLead = await req.payload.find({
    collection: 'leads',
    sort: '-createdAt',
    limit: 1,
    where: {
      assignedTo: {
        exists: true,
      },
    },
  })

  let assignedAgent: AgentDoc
  if (lastLead.docs.length === 0) {
    assignedAgent = agents.docs[0] as AgentDoc
  } else {
    const lastLeadDoc = lastLead.docs[0] as LeadDoc
    const lastAssignedAgentId =
      typeof lastLeadDoc.assignedTo === 'object' ? lastLeadDoc.assignedTo?.id : lastLeadDoc.assignedTo

    const currentIndex = agents.docs.findIndex((a) => a.id === lastAssignedAgentId)

    // Tratar explicitamente currentIndex === -1
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % agents.docs.length
    assignedAgent = agents.docs[nextIndex] as AgentDoc
  }

  // Atualizar o lead com o corretor atribuído e retornar o documento atualizado
  const updatedLead = await req.payload.update({
    collection: 'leads',
    id: doc.id,
    data: {
      assignedTo: assignedAgent.id,
    },
  })

  return updatedLead
}
