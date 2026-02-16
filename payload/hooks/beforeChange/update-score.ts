import type { CollectionBeforeChangeHook } from 'payload'

interface LeadData {
  phone?: string
  email?: string
  score?: number
}

export const updateLeadScore: CollectionBeforeChangeHook = async ({ data }) => {
  const leadData = data as Partial<LeadData>
  let score = 0
  if (leadData.phone) score += 20
  if (leadData.email) score += 20
  leadData.score = Math.max(0, Math.min(100, score))
  return data
}
