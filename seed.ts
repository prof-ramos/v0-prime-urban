import type { Payload } from 'payload'
import { seedUsers } from './payload/seeds/users'

export const seed = async (payload: Payload): Promise<void> => {
  console.log('🌱 Starting seed...')
  await seedUsers(payload)

  console.log('\n✅ Seed completed!')
  console.log('\n📝 Test users:')
  console.log('  - admin@primeurban.test / test-admin-pass-123 (admin)')
  console.log('  - agent@primeurban.test / test-agent-pass-123 (agent)')
  console.log('\nYou can now run the tests:')
  console.log('  uv run --python venv/bin/python -m pytest tests/api/collections/test_properties.py -v')
}
