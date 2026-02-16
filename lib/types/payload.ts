import { z } from 'zod'
import type { User } from '../../payload/payload-types'

// ============= GENERIC TYPES =============

/**
 * Generic type for documents that have a `code` field.
 * Used for typed access to auto-generated codes.
 */
export type WithCode<T> = T & { code: string }

// ============= ZOD SCHEMAS =============

/**
 * Zod schema for validating Agent documents (subset of User).
 * Ensures role is 'agent' and includes creci field.
 */
export const AGENT_DOC_SCHEMA = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.literal('agent'),
  creci: z.string().optional(),
  active: z.boolean().optional(),
})

/**
 * Zod schema for validating Property documents.
 * Focuses on core fields: id, title, code, status, type.
 */
export const PropertyDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
  status: z.enum(['draft', 'published', 'sold', 'rented', 'paused']),
  type: z.enum(['sale', 'rent']),
})

/**
 * Zod schema for validating Lead documents.
 * Includes core fields: id, name, phone, email, status, priority, score.
 */
export const LeadDocSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  status: z.enum([
    'new',
    'contacted',
    'qualified',
    'visit_scheduled',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost',
  ]),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  score: z.number().optional(),
})

// ============= TYPE GUARDS =============

/**
 * Type guard to check if a document is a valid Agent.
 * Uses AgentDocSchema for runtime validation.
 */
export function isValidAgent(doc: unknown): doc is z.infer<typeof AGENT_DOC_SCHEMA> {
  return AGENT_DOC_SCHEMA.safeParse(doc).success
}

/**
 * Type guard to check if a document is a valid Property.
 * Uses PropertyDocSchema for runtime validation.
 */
export function isValidProperty(doc: unknown): doc is z.infer<typeof PropertyDocSchema> {
  return PropertyDocSchema.safeParse(doc).success
}

/**
 * Type guard to check if a document is a valid Lead.
 * Uses LeadDocSchema for runtime validation.
 */
export function isValidLead(doc: unknown): doc is z.infer<typeof LeadDocSchema> {
  return LeadDocSchema.safeParse(doc).success
}

/**
 * Type guard to check if a User is an Agent.
 * Narrowing function for User -> AgentUser.
 */
export function isAgent(user: User | null | undefined): user is User & { role: 'agent' } {
  return user?.role === 'agent'
}
