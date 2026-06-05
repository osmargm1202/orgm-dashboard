import type { ServiceRecord } from './types'

export type LinkSource = 'public' | 'final' | 'same-network' | 'internal' | 'unavailable'

export interface LinkResolution {
  url: string | null
  source: LinkSource
  isInternalOnly: boolean
  isInternal: boolean
  isUnavailable: boolean
  linkLabel: 'public' | 'internal' | 'internal-only link' | 'unavailable'
  badgeClass: 'badge-public' | 'badge-internal' | 'badge-unavailable'
}

const INTERNAL_BADGE_CLASS = 'badge-internal'
const PUBLIC_BADGE_CLASS = 'badge-public'
const UNAVAILABLE_BADGE_CLASS = 'badge-unavailable'

export function isPrivateHost(value: string): boolean {
  const host = value.toLowerCase()

  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return true
  }

  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) {
    return true
  }

  if (host.startsWith('127.') || host.startsWith('10.') || host === '0.0.0.0' || host.startsWith('192.168.') || host.startsWith('169.254.')) {
    return true
  }

  if (host.startsWith('172.')) {
    const second = Number(host.split('.')[1])

    if (!Number.isNaN(second) && second >= 16 && second <= 31) {
      return true
    }
  }

  return false
}

function isPrivateUrl(value: string): boolean {
  try {
    const parsed = new URL(value)

    return isPrivateHost(parsed.hostname)
  } catch {
    return false
  }
}

export function isPublicHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value)

    if (parsed.protocol !== 'https:') {
      return false
    }

    return !isPrivateHost(parsed.hostname)
  } catch {
    return false
  }
}

export function classifyServiceLink(visibility: ServiceRecord['visibility']): string {
  const normalized = visibility.replace('-', ' ').toLowerCase()

  if (normalized === 'public candidate' || normalized === 'public') {
    return 'Public'
  }

  if (normalized === 'internal first') {
    return 'Internal'
  }

  if (normalized === 'internal only' || normalized === 'infra only') {
    return 'Infra'
  }

  if (normalized === 'platform core') {
    return 'Public'
  }

  return 'Other'
}

function makeResolution(
  options: {
    url: string | null
    source: LinkSource
    isInternalOnly: boolean
    isInternal: boolean
    linkLabel: 'public' | 'internal' | 'internal-only link' | 'unavailable'
    badgeClass: 'badge-public' | 'badge-internal' | 'badge-unavailable'
  },
): LinkResolution {
  return {
    ...options,
    isUnavailable: options.source === 'unavailable',
  }
}

export function resolveServicePrimaryLink(service: ServiceRecord): LinkResolution {
  if (service.publicUrl && isPublicHttpsUrl(service.publicUrl)) {
    return makeResolution({
      url: service.publicUrl,
      source: 'public',
      isInternalOnly: false,
      isInternal: false,
      linkLabel: 'public',
      badgeClass: PUBLIC_BADGE_CLASS,
    })
  }

  if (service.finalUrl) {
    const isInternal = isPrivateUrl(service.finalUrl)
    return makeResolution({
      url: service.finalUrl,
      source: 'final',
      isInternalOnly: false,
      isInternal,
      linkLabel: isInternal ? 'internal' : 'public',
      badgeClass: isInternal ? INTERNAL_BADGE_CLASS : PUBLIC_BADGE_CLASS,
    })
  }

  if (service.visibility === 'internal-only' && service.sameNetworkUrl) {
    return makeResolution({
      url: service.sameNetworkUrl,
      source: 'same-network',
      isInternalOnly: true,
      isInternal: true,
      linkLabel: 'internal-only link',
      badgeClass: INTERNAL_BADGE_CLASS,
    })
  }

  const fallback = service.internalUrl ?? service.sameNetworkUrl

  if (fallback) {
    return makeResolution({
      url: fallback,
      source: 'internal',
      isInternalOnly: false,
      isInternal: true,
      linkLabel: 'internal',
      badgeClass: INTERNAL_BADGE_CLASS,
    })
  }

  return makeResolution({
    url: null,
    source: 'unavailable',
    isInternalOnly: false,
    isInternal: false,
    linkLabel: 'unavailable',
    badgeClass: UNAVAILABLE_BADGE_CLASS,
  })
}
