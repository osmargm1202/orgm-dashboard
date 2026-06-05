import type { DashboardManifest } from './types'
import { DashboardManifestSchema } from './schema'

const MANIFEST_PATH = '/config/dashboard.base.json'

export async function loadDashboardManifest(): Promise<DashboardManifest> {
  let response: Response

  try {
    response = await fetch(MANIFEST_PATH)
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Failed to fetch dashboard manifest from ${MANIFEST_PATH}: ${reason}`)
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard manifest from ${MANIFEST_PATH}: ${response.status} ${response.statusText}`,
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Failed to parse dashboard manifest JSON from ${MANIFEST_PATH}: ${reason}`)
  }

  const parsed = DashboardManifestSchema.safeParse(payload)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')

    throw new Error(`Invalid dashboard manifest from ${MANIFEST_PATH}: ${details}`)
  }

  return parsed.data
}
