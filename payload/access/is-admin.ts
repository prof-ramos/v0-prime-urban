import type { Access, AccessResult } from 'payload'

export const isAdmin: Access = ({ req: { user } }): AccessResult => {
  return user?.role === 'admin'
}
