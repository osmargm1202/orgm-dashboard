import type { ServiceRecord } from '../manifest/types'

export interface GroupedServiceSection {
  section: string
  services: ServiceRecord[]
}

const SECTION_ORDER = ['Public', 'Ops', 'Infra', 'Tools', 'Internal', 'Reference', 'Security', 'Other']

function toSection(group: string): string {
  const normalized = group.toLowerCase()

  if (normalized.includes('public')) {
    return 'Public'
  }

  if (normalized.includes('ops')) {
    return 'Ops'
  }

  if (normalized.includes('infra')) {
    return 'Infra'
  }

  if (normalized.includes('tool')) {
    return 'Tools'
  }

  if (normalized.includes('internal')) {
    return 'Internal'
  }

  if (normalized.includes('reference')) {
    return 'Reference'
  }

  if (normalized.includes('security')) {
    return 'Security'
  }

  return 'Other'
}

export function groupServices(services: ServiceRecord[]): GroupedServiceSection[] {
  const buckets: Record<string, ServiceRecord[]> = {
    Public: [],
    Ops: [],
    Infra: [],
    Tools: [],
    Internal: [],
    Reference: [],
    Security: [],
    Other: [],
  }

  for (const service of services) {
    const section = toSection(service.group)
    buckets[section].push(service)
  }

  return SECTION_ORDER.map((section) => ({
    section,
    services: buckets[section],
  }))
}
