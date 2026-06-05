import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { DashboardManifest } from './types'
import { DashboardManifestSchema } from './schema'

const MANIFEST_PATH = '/config/dashboard.base.json'
const MANIFEST_FILE_PATH = resolve(process.cwd(), 'public', 'config', 'dashboard.base.json')

function parseManifest(payload: unknown): DashboardManifest {
  const parsed = DashboardManifestSchema.safeParse(payload)

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')

    throw new Error(`Invalid dashboard manifest from ${MANIFEST_PATH}: ${details}`)
  }

  return parsed.data
}

async function loadDashboardManifestFromFile(): Promise<DashboardManifest> {
  const raw = await readFile(MANIFEST_FILE_PATH, 'utf8')
  const payload = JSON.parse(raw)

  return parseManifest(payload)
}

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

  return parseManifest(payload)
}

export async function loadManifest(): Promise<DashboardManifest> {
  try {
    return await loadDashboardManifest()
  } catch (error) {
    if (typeof process !== 'undefined' && process.versions?.node) {
      return loadDashboardManifestFromFile()
    }

    throw error
  }
}

export const getManifestDiskPath = (): string => {
  return MANIFEST_FILE_PATH
}
