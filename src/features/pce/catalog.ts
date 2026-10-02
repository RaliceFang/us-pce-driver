import { z } from 'zod'
export const transforms = ['yoy', 'mom'] as const
export const breakdowns = ['basic4', 'detail6', 'major16', 'granular'] as const
export const ranges = ['12', '36', '60', '120', 'all'] as const
export const searchSchema = z.object({ tf: z.enum(transforms).catch('yoy'), bk: z.enum(breakdowns).catch('basic4'), range: z.enum(ranges).catch('60'), month: z.string().regex(/^\d{4}-\d{2}$/).optional().catch(undefined) })
export type Settings = z.infer<typeof searchSchema>
