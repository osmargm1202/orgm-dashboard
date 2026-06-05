import { describe, expect, test } from 'vitest'
import type { ServiceRecord } from '../../src/lib/manifest/types'
import {
  mergeManifestServices,
  type OverlayPayload,
  type OverlayService,
} from '../../src/lib/overlay/merge'

const baseServices: ServiceRecord[] = [
  {
    id: 'svc-a',
    name: 'Service A',
    description: 'base a',
    group: 'public',
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
    publicUrl: 'https://a.example',
    sameNetworkUrl: 'http://svc-a.internal',
    visibility: 'public',
    assetRef: {
      logoRef: 'assets/logos/svc-a.svg',
      iconRef: 'assets/icons/svc-a.svg',
    },
  },
  {
    id: 'svc-b',
    name: 'Service B',
    description: 'base b',
    group: 'internal',
    containerName: 'svc-b',
    image: 'repo/svc-b:latest',
    status: 'exited',
    networks: ['default'],
    ports: [
      {
        host: '127.0.0.1',
        hostPort: 81,
        containerPort: 81,
        protocol: 'tcp',
      },
    ],
    urlHints: [],
    finalUrl: 'https://b.example',
    publicUrl: 'https://public-b',
    visibility: 'internal-only',
    assetRef: {
      logoRef: 'assets/logos/svc-b.svg',
      iconRef: 'assets/icons/svc-b.svg',
    },
  },
  {
    id: 'svc-c',
    name: 'Service C',
    description: 'base c',
    group: 'public',
    containerName: 'svc-c',
    image: 'repo/svc-c:latest',
    status: 'running',
    networks: ['default'],
    ports: [
      {
        host: '127.0.0.1',
        hostPort: 82,
        containerPort: 82,
        protocol: 'tcp',
      },
    ],
    urlHints: [],
    finalUrl: 'https://c.example',
    publicUrl: 'https://public-c',
    visibility: 'public-candidate',
    assetRef: {
      logoRef: 'assets/logos/svc-c.svg',
      iconRef: 'assets/icons/svc-c.svg',
    },
  },
]

describe('overlay merge', () => {
  test('merges partial service overlays by id and keeps base fields', () => {
    const overlay: OverlayPayload = {
      services: [
        {
          id: 'svc-a',
          name: 'Overlay Name',
          assetRef: {
            iconRef: 'assets/icons/svc-a-overlay.svg',
          },
        } as OverlayService,
        {
          id: 'svc-b',
          publicUrl: 'https://public-b-overlay',
          visibility: 'public',
        } as OverlayService,
      ],
    }

    const merged = mergeManifestServices(baseServices, overlay)

    expect(merged).toHaveLength(3)
    expect(merged[0]).toMatchObject({
      id: 'svc-a',
      name: 'Overlay Name',
      finalUrl: null,
      assetRef: {
        logoRef: 'assets/logos/svc-a.svg',
        iconRef: 'assets/icons/svc-a-overlay.svg',
      },
    })
    expect(merged[1]).toMatchObject({
      id: 'svc-b',
      publicUrl: 'https://public-b-overlay',
      visibility: 'public',
      status: 'exited',
    })
  })

  test('ignores unmatched and invalid overlay entries and keeps base order fallback', () => {
    const overlay: OverlayPayload = {
      services: [
        {
          id: 'svc-missing',
          name: 'No Service',
        } as OverlayService,
        42 as never,
        {
          id: 'svc-a',
          order: 2,
        } as OverlayService,
        {
          id: 'svc-c',
          order: 0,
          name: 'Service C Overlay',
        } as OverlayService,
      ],
    }

    const merged = mergeManifestServices(baseServices, overlay)

    expect(merged[0].id).toBe('svc-c')
    expect(merged[0].name).toBe('Service C Overlay')
    expect(merged[1].id).toBe('svc-b')
    expect(merged[2].id).toBe('svc-a')
    expect(merged[2].name).toBe('Service A')
  })
})
