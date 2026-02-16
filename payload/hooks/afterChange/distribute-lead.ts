import type { CollectionAfterChangeHook } from 'payload'
import type { Lead } from '../../payload-types'

type Identifier = number

const getIdentifier = (value: unknown): Identifier | null => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (!value || typeof value !== 'object' || !('id' in value)) return null

  const id = (value as { id?: unknown }).id
  if (typeof id === 'number') return id
  if (typeof id === 'string') {
    const parsed = Number.parseInt(id, 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

const pickNextAgentId = (
  agentIds: Identifier[],
  lastAssignedId: Identifier | null
): Identifier => {
  if (!lastAssignedId) return agentIds[0]

  const currentIndex = agentIds.findIndex((id) => String(id) === String(lastAssignedId))
  if (currentIndex < 0) return agentIds[0]

  return agentIds[(currentIndex + 1) % agentIds.length]
}

export const distributeLead: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (req.context?.internalUpdate) return doc

  if (operation !== 'create') return doc

  const lead = doc as Lead

  if (lead.assignedTo) {
    return doc
  }

  try {
    const agents = await req.payload.find({
      collection: 'users',
      where: {
        role: { equals: 'agent' },
        active: { equals: true },
      },
      depth: 0,
      limit: 100,
      sort: 'createdAt',
    })

    if (agents.docs.length === 0) return doc

    const agentIds = agents.docs
      .map((agent) => getIdentifier(agent.id))
      .filter((id): id is Identifier => id !== null)

    if (agentIds.length === 0) return doc

    const lastAssignedLead = await req.payload.find({
      collection: 'leads',
      depth: 0,
      limit: 1,
      sort: '-updatedAt',
      where: {
        and: [
          { assignedTo: { exists: true } },
          { id: { not_equals: lead.id } },
        ],
      },
    })

    const lastAssignedId = getIdentifier(lastAssignedLead.docs[0]?.assignedTo)
    const nextAgentId = pickNextAgentId(agentIds, lastAssignedId)

    const updatedLead = await req.payload.update({
      collection: 'leads',
      id: lead.id,
      data: {
        assignedTo: nextAgentId,
      },
      context: {
        internalUpdate: true,
      },
      req,
    })

    return updatedLead
  } catch (error: unknown) {
    req.payload.logger.error({
      msg: 'Falha ao distribuir lead',
      leadId: lead.id,
      err: error,
    })
  }

  return doc
}
