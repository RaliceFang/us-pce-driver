import { z } from 'zod'
export const transforms = ['mom', 'yoy'] as const
export const breakdowns = ['basic4', 'detail6', 'major16', 'granular'] as const
export const contributionBases = ['parent', 'headline'] as const
export const ranges = ['12', '36', '60', '120', 'all'] as const
export const searchSchema = z.object({ basis:z.enum(contributionBases).catch('parent'), tf: z.enum(transforms).catch('mom'), bk: z.enum(breakdowns).catch('basic4'), range: z.enum(ranges).catch('60'), node: z.string().regex(/^\d{1,3}$/).optional().catch(undefined), month: z.string().regex(/^\d{4}-\d{2}$/).optional().catch(undefined) })
export type Settings = z.infer<typeof searchSchema>
