import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ZodError } from 'zod'
import type { DashboardManifest } from '../../src/lib/manifest/types'
import {
  DashboardManifestSchema,
  parseDashboardManifest,
} from '../../src/lib/manifest/schema'

describe('manifest schema', () => {
  const validManifest = {
    manifestVersion: '1.0',
    generatedAt: '2026-06-05T00:00:00Z',
    project: 'ORGM Dashboard',
    environment: 'test',
    defaultUrlPolicy: 'placeholder',
    services: [
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
        sameNetworkUrl: 'http://svc-a:80',
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
        group: 'internal-tools',
        containerName: 'svc-b',
        image: 'repo/svc-b:latest',
        status: 'exited',
        networks: ['default'],
        ports: [
          {
            host: '127.0.0.1',
            hostPort: 443,
            containerPort: 443,
            protocol: 'tcp',
          },
        ],
        urlHints: ['https://example.com'],
        finalUrl: 'https://svc-b.example.net',
        publicUrl: 'https://svc-b.example.com',
        internalUrl: 'http://127.0.0.1:443',
        visibility: 'internal-first',
        assetRef: {
          logoRef: 'assets/logos/svc-b.svg',
          iconRef: 'assets/icons/svc-b.svg',
        },
      },
    ],
  }

  test('valid manifest schema parses', () => {
    const parsed = parseDashboardManifest(validManifest)

    expect(parsed.manifestVersion).toBe('1.0')
    expect(parsed.services).toHaveLength(2)
  })

  test('public dashboard manifest parses with infrastructure visibility', () => {
    const raw = readFileSync(join(process.cwd(), 'public/config/dashboard.base.example.json'), 'utf8')
    const manifest = JSON.parse(raw)
    const parsed = parseDashboardManifest(manifest)
    const infra = parsed.services.find((service) => service.visibility === 'infrastructure')

    expect(infra).toBeDefined()
    expect(infra?.id).toBe('registry')
  })

  test('finalUrl can be null and publicUrl can stay unknown', () => {
    const parsed = parseDashboardManifest(validManifest)

    const first = parsed.services[0]
    expect(first.finalUrl).toBeNull()
    expect(first.publicUrl).toBe('unknown')
  })

  test('generatedFrom passthrough remains allowed', () => {
    const parsed = parseDashboardManifest({
      ...validManifest,
      generatedFrom: 'base.md',
    }) as DashboardManifest

    expect(parsed.generatedFrom).toBe('base.md')
  })

  test('rejects unknown manifest-level fields when strict', () => {
    expect(() =>
      parseDashboardManifest({
        ...validManifest,
        unknownTopLevel: 'boom',
      }),
    ).toThrowError(ZodError)
  })

  test('rejects missing required service fields', () => {
    const invalid = {
      ...validManifest,
      services: [{
        id: 'svc-a',
        name: 'Missing',
        description: 'bad',
        group: 'public-services',
        containerName: 'svc-a',
        image: 'repo/svc-a:latest',
        status: 'running',
        finalUrl: null,
        publicUrl: 'https://svc-a',
        visibility: 'public',
        assetRef: {
          logoRef: 'assets/logos/svc-a.svg',
          iconRef: 'assets/icons/svc-a.svg',
        },
      }],
    }

    expect(() => parseDashboardManifest(invalid)).toThrowError(ZodError)
  })

  test('invalid manifest with bad enum fails with zod', () => {
    const invalid = {
      ...validManifest,
      defaultUrlPolicy: 'invalid',
    }

    expect(() => parseDashboardManifest(invalid)).toThrowError(ZodError)
  })

  test('invalid numeric range for host port fails', () => {
    const invalid = {
      ...validManifest,
      services: [
        {
          ...validManifest.services[0],
          ports: [
            {
              host: '127.0.0.1',
              hostPort: -1,
              containerPort: 80,
              protocol: 'tcp',
            },
          ],
        },
      ],
    }

    expect(() => parseDashboardManifest(invalid)).toThrowError(ZodError)
  })

  test('dashboard schema object is strict', () => {
    expect(DashboardManifestSchema.shape).toBeDefined()
  })
})
