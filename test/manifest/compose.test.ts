import { describe, expect, test } from 'vitest'
import { filterByVisibility, getServiceById, groupedBySection } from '../../src/lib/manifest/compose'
import type { ServiceRecord } from '../../src/lib/manifest/types'

describe('manifest compose helpers', () => {
  const services: ServiceRecord[] = [
    {
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
    },
    {
      id: 'svc-b',
      name: 'Service B',
      description: 'desc',
      group: 'infrastructure',
      containerName: 'svc-b',
      image: 'repo/svc-b:latest',
      status: 'unknown',
      networks: ['default'],
      ports: [
        {
          host: '127.0.0.1',
          hostPort: 443,
          containerPort: 443,
          protocol: 'tcp',
        },
      ],
      urlHints: [],
      finalUrl: null,
      publicUrl: 'https://svc-b',
      visibility: 'public-candidate',
      assetRef: {
        logoRef: 'assets/logos/svc-b.svg',
        iconRef: 'assets/icons/svc-b.svg',
      },
    },
  ]

  test('getServiceById finds existing record', () => {
    expect(getServiceById(services, 'svc-b')).toEqual(services[1])
    expect(getServiceById(services, 'missing')).toBeUndefined()
  })

  test('filterByVisibility keeps allowed list and preserves order', () => {
    const filtered = filterByVisibility(services, ['public'])

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('svc-a')
  })

  test('groupedBySection groups by section key', () => {
    const grouped = groupedBySection(services)

    expect(grouped['public-services'][0].id).toBe('svc-a')
    expect(grouped['infrastructure'][0].id).toBe('svc-b')
  })
})
