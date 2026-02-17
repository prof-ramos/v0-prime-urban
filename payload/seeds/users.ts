import type { Payload } from 'payload'

interface SeedUser {
  email: string
  password: string
  name: string
  role: 'admin' | 'agent'
  creci?: string
}

const TEST_USERS: SeedUser[] = [
  {
    email: 'admin@primeurban.test',
    password: 'test-admin-pass-123',
    name: 'Admin Test',
    role: 'admin',
  },
  {
    email: 'agent@primeurban.test',
    password: 'test-agent-pass-123',
    name: 'Agent Test',
    role: 'agent',
    creci: 'DF12345',
  },
]

export const seedUsers = async (payload: Payload): Promise<void> => {
  console.log('👤 Seeding users...')
  const failedUsers: string[] = []

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existingUser = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: userData.email,
          },
        },
        depth: 0,
      })

      const commonData = {
        name: userData.name,
        role: userData.role,
        active: true,
        creci: userData.role === 'agent' ? userData.creci : null,
      }

      if (existingUser.totalDocs > 0) {
        const existingDoc = existingUser.docs[0]

        await payload.update({
          collection: 'users',
          id: existingDoc.id,
          data: {
            ...commonData,
            password: userData.password,
            loginAttempts: 0,
            lockUntil: null,
          },
        })

        console.log(`  ✓ User synchronized: ${userData.email}`)
        continue
      }

      // Create user
      await payload.create({
        collection: 'users',
        data: {
          ...commonData,
          email: userData.email,
          password: userData.password,
        },
      })

      console.log(`  ✓ Created user: ${userData.email} (${userData.role})`)
    } catch (error) {
      console.error(`  ✗ Failed to create user ${userData.email}:`, error)
      failedUsers.push(userData.email)
    }
  }

  if (failedUsers.length > 0) {
    throw new Error(`Failed to seed users: ${failedUsers.join(', ')}`)
  }

  console.log('👤 Users seeded!')
}
