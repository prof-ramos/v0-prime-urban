import type { Access, AccessResult } from 'payload'

export const isAgent: Access = ({ req: { user } }): AccessResult => {
  return Boolean(user?.role === 'admin' || user?.role === 'agent')
}
