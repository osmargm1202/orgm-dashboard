import { beforeEach, describe, expect, test, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadDashboardManifest } from '../../src/lib/manifest/loader'

const validManifest = JSON.parse(
  readFileSync(join(process.cwd(), 'public/config/dashboard.base.example.json'), 'utf8'),
)

describe('manifest loader', () => {
  const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  function makeResponse(jsonValue: unknown, status = 200, statusText = 'OK', ok = true): Response {
    const response: Partial<Response> = {
      ok,
      status,
      statusText,
      json: vi.fn().mockResolvedValue(jsonValue),
    }

    return response as Response
  }

  test('loads and parses manifest JSON from dashboard.base.json', async () => {
    fetchMock.mockResolvedValue(makeResponse(validManifest))

    const manifest = await loadDashboardManifest()

    expect(fetchMock).toHaveBeenCalledWith('/config/dashboard.base.json')
    expect(manifest.project).toBe(validManifest.project)
    expect(manifest.services[0]).toMatchObject({
      id: validManifest.services[0].id,
    })
  })

  test('throws on HTTP error response', async () => {
    fetchMock.mockResolvedValue(makeResponse({}, 500, 'Server error', false))

    await expect(loadDashboardManifest()).rejects.toThrow(
      'Failed to fetch dashboard manifest from /config/dashboard.base.json: 500 Server error',
    )
  })

  test('throws on manifest parse error', async () => {
    fetchMock.mockResolvedValue(makeResponse({ project: 'bad', services: [] }))

    await expect(loadDashboardManifest()).rejects.toThrow(/Invalid dashboard manifest from \/config\/dashboard\.base\.json/)
  })

  test('throws on network failure', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    await expect(loadDashboardManifest()).rejects.toThrow(
      'Failed to fetch dashboard manifest from /config/dashboard.base.json: network down',
    )
  })
})
