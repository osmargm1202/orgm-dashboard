import type { ServiceRecord } from '../manifest/types'

export interface StatusVisualConfig {
  label: string
  badgeClass: string
}

const statusMap: Record<ServiceRecord['status'], StatusVisualConfig> = {
  running: {
    label: 'running',
    badgeClass: 'status-running',
  },
  exited: {
    label: 'stopped',
    badgeClass: 'status-exited',
  },
  unknown: {
    label: 'unknown',
    badgeClass: 'status-unknown',
  },
}

export function getStatusBadge(status: ServiceRecord['status']): StatusVisualConfig {
  return statusMap[status]
}

export function badgeFromStatus(status: string): StatusVisualConfig {
  return statusMap[status as ServiceRecord['status']] ?? {
    label: 'unknown',
    badgeClass: 'status-unknown',
  }
}
