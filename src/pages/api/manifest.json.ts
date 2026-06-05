import type { DashboardManifest } from '../../lib/manifest/types'
import { loadManifest } from '../../lib/manifest/loader'

export interface ManifestEndpointPayload {
  manifest: DashboardManifest
  overlayCount: number
  source: 'mounted'
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

export const prerender = true

export async function GET() {
  const manifest = await loadManifest()

  const payload: ManifestEndpointPayload = {
    manifest,
    overlayCount: 0,
    source: 'mounted',
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: JSON_HEADERS,
  })
}
