import { z } from 'zod'
import type { DashboardManifest } from './types'

export const VisibilitySchema = z.enum([
  'public-candidate',
  'public',
  'internal-first',
  'internal-only',
  'infra-only',
  'platform-core',
  'reference',
])

export const UrlPortSchema = z.strictObject({
  host: z.string().min(1),
  hostPort: z.number().int().min(0).max(65535),
  containerPort: z.number().int().min(1).max(65535),
  protocol: z.enum(['tcp', 'udp']),
})

export const AssetRefSchema = z.strictObject({
  logoRef: z.string().min(1),
  iconRef: z.string().min(1),
  coverRef: z.string().min(1).optional(),
})

export const ServiceRecordSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  group: z.string().min(1),
  containerName: z.string().min(1),
  image: z.string().min(1),
  status: z.enum(['running', 'exited', 'unknown']),
  networks: z.array(z.string().min(1)),
  ports: z.array(UrlPortSchema),
  urlHints: z.array(z.string()),
  finalUrl: z.string().nullable(),
  publicUrl: z.string().min(1),
  sameNetworkUrl: z.string().optional(),
  internalUrl: z.string().optional(),
  visibility: VisibilitySchema,
  assetRef: AssetRefSchema,
})

export const DashboardManifestSchema = z
  .strictObject({
    manifestVersion: z.string().min(1),
    generatedAt: z.string().min(1),
    project: z.string().min(1),
    environment: z.string().min(1),
    generatedFrom: z.string().optional(),
    defaultUrlPolicy: z.enum(['placeholder', 'manual']),
    services: z.array(ServiceRecordSchema),
  })

export function parseDashboardManifest(input: unknown): DashboardManifest {
  return DashboardManifestSchema.parse(input) as DashboardManifest
}

export function safeParseDashboardManifest(input: unknown): {
  success: boolean
  data?: DashboardManifest
  error?: z.ZodError
} {
  const parsed = DashboardManifestSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error,
    }
  }

  return {
    success: true,
    data: parsed.data as DashboardManifest,
  }
}
