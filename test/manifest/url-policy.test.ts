import { describe, expect, test } from 'vitest'
import type { ServiceRecord } from '../../src/lib/manifest/types'
import {
  isPrivateHost,
  isPublicHttpsUrl,
  resolveServicePrimaryLink,
} from '../../src/lib/manifest/link-policy'
import { groupServices } from '../../src/lib/services/grouping'

const serviceBase: Omit<ServiceRecord, 'id' | 'publicUrl' | 'finalUrl' | 'sameNetworkUrl' | 'internalUrl' | 'visibility'> & {
  id: string
  publicUrl: string
  finalUrl: string | null
  sameNetworkUrl?: string
  internalUrl?: string
  visibility: ServiceRecord['visibility']
} = {
  id: 'svc-a',
  name: 'Service A',
  description: 'desc',
  group: 'public-services',
  containerName: 'svc-a',
  image: 'repo/svc-a:latest',
  status: 'running',
  networks: ['default'],
  ports: [
    {
      host: '127.0.0.1',
      hostPort: 80,
      containerPort: 80,
      protocol: 'tcp',
    },
  ],
  urlHints: [],
  finalUrl: null,
  publicUrl: 'unknown',
  visibility: 'public',
  assetRef: {
    logoRef: 'assets/logos/svc-a.svg',
    iconRef: 'assets/icons/svc-a.svg',
  },
}

describe('URL policy', () => {
  test('prefers valid public HTTPS URL over private or fallback URLs', () => {
    const service: ServiceRecord = {
      ...serviceBase,
      id: 'svc-a',
      publicUrl: 'https://portal.example.com',
      finalUrl: 'https://fallback.example.org',
      internalUrl: 'http://127.0.0.1:80',
      sameNetworkUrl: 'http://svc-a:80',
      visibility: 'public-candidate',
    }

    const resolved = resolveServicePrimaryLink(service)

    expect(resolved.url).toBe('https://portal.example.com')
    expect(resolved.source).toBe('public')
    expect(resolved.linkLabel).toBe('public')
    expect(resolved.badgeClass).toBe('badge-public')
    expect(resolved.isInternal).toBe(false)
    expect(resolved.isUnavailable).toBe(false)
  })

  test('uses finalUrl when public URL is missing or private', () => {
    const service: ServiceRecord = {
      ...serviceBase,
      id: 'svc-b',
      publicUrl: 'http://portal.local',
      finalUrl: 'https://final.example.org',
      internalUrl: 'http://127.0.0.1:8080',
      sameNetworkUrl: 'http://svc-b:8080',
      visibility: 'public-candidate',
    }

    const resolved = resolveServicePrimaryLink(service)

    expect(resolved.url).toBe('https://final.example.org')
    expect(resolved.source).toBe('final')
    expect(resolved.linkLabel).toBe('public')
    expect(resolved.badgeClass).toBe('badge-public')
    expect(resolved.isInternal).toBe(false)
    expect(resolved.isUnavailable).toBe(false)
  })

  test('internal-only services use same-network URL with explicit warning', () => {
    const service: ServiceRecord = {
      ...serviceBase,
      id: 'svc-c',
      publicUrl: 'unknown',
      finalUrl: null,
      internalUrl: 'http://127.0.0.1:8080',
      sameNetworkUrl: 'http://svc-c:8080',
      visibility: 'internal-only',
    }

    const resolved = resolveServicePrimaryLink(service)

    expect(resolved.url).toBe('http://svc-c:8080')
    expect(resolved.source).toBe('same-network')
    expect(resolved.isInternal).toBe(true)
    expect(resolved.linkLabel).toBe('internal-only link')
    expect(resolved.badgeClass).toBe('badge-internal')
    expect(resolved.isUnavailable).toBe(false)
  })

  test('private hosts are detected and marked internal when final URL resolves locally', () => {
    const service: ServiceRecord = {
      ...serviceBase,
      id: 'svc-d',
      publicUrl: 'https://192.168.1.15',
      finalUrl: 'http://127.0.0.1:8888',
      internalUrl: 'http://127.0.0.1:8888',
      sameNetworkUrl: 'http://svc-d:8888',
      visibility: 'internal-first',
    }

    expect(isPrivateHost('127.0.0.1')).toBe(true)
    expect(isPrivateHost('192.168.1.15')).toBe(true)

    const resolved = resolveServicePrimaryLink(service)

    expect(resolved.url).toBe('http://127.0.0.1:8888')
    expect(resolved.source).toBe('final')
    expect(resolved.linkLabel).toBe('internal')
    expect(resolved.isInternal).toBe(true)
    expect(resolved.badgeClass).toBe('badge-internal')
    expect(resolved.isUnavailable).toBe(false)
  })

  test('unavailable services expose empty-state metadata', () => {
    const service: ServiceRecord = {
      ...serviceBase,
      id: 'svc-e',
      publicUrl: 'unknown',
      finalUrl: null,
      visibility: 'reference',
      internalUrl: undefined,
      sameNetworkUrl: undefined,
    }

    const resolved = resolveServicePrimaryLink(service)

    expect(resolved.url).toBeNull()
    expect(resolved.source).toBe('unavailable')
    expect(resolved.isUnavailable).toBe(true)
    expect(resolved.isInternal).toBe(false)
    expect(resolved.linkLabel).toBe('unavailable')
    expect(resolved.badgeClass).toBe('badge-unavailable')
  })

  test('groups services into configured sections', () => {
    const services: ServiceRecord[] = [
      {
        ...serviceBase,
        id: 'public-1',
        visibility: 'public',
        group: 'public-services',
      },
      {
        ...serviceBase,
        id: 'ops-1',
        visibility: 'public',
        group: 'ops',
      },
      {
        ...serviceBase,
        id: 'infra-1',
        visibility: 'public',
        group: 'infrastructure',
      },
      {
        ...serviceBase,
        id: 'other-1',
        visibility: 'public',
        group: 'random',
      },
    ]

    const grouped = groupServices(services)

    expect(grouped.map((entry) => entry.section)).toEqual([
      'Public',
      'Ops',
      'Infra',
      'Tools',
      'Internal',
      'Reference',
      'Security',
      'Other',
    ])
    expect(grouped[0].services[0].id).toBe('public-1')
    expect(grouped[1].services[0].id).toBe('ops-1')
    expect(grouped[2].services[0].id).toBe('infra-1')
    expect(grouped[7].services[0].id).toBe('other-1')
  })

  test('public url validation rejects private and unknown', () => {
    expect(isPublicHttpsUrl('https://192.168.1.10')).toBe(false)
    expect(isPublicHttpsUrl('https://127.0.0.1')).toBe(false)
    expect(isPublicHttpsUrl('https://localhost')).toBe(false)
    expect(isPublicHttpsUrl('https://example.com')).toBe(true)
  })
})
