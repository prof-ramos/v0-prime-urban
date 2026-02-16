import type { Access, AccessResult, Where } from 'payload'

export const isOwnerOrAdmin: Access = ({ req: { user } }): AccessResult => {
  if (!user) return false
  if (user.role === 'admin') return true

  // Allow access if user is the owner (assignedTo or agent)
  return {
    or: [
      {
        assignedTo: {
          equals: user.id,
        },
      },
      {
        agent: {
          equals: user.id,
        },
      },
    ],
  } as Where
}
