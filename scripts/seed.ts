import config from '../payload/payload.config'
import { getPayload } from 'payload'

import { seed } from '../seed'

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  try {
    await seed(payload)
  } finally {
    await payload.destroy()
  }
}

await run()
