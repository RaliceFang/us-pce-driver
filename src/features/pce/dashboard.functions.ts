import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { searchSchema } from './catalog'
export const getDashboard = createServerFn({ method: 'GET' })
  .validator(searchSchema.extend({ locale: z.enum(['zh-tw', 'zh-cn', 'en']) }))
  .handler(async ({ data }) => {
    const { getSnapshotView } = await import('./snapshot.server')
    return getSnapshotView(data)
  })
