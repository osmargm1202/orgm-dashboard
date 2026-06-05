import { describe, expect, test } from 'vitest'
import { GET } from '../../src/pages/api/manifest.json'

describe('manifest api endpoint', () => {
  test('returns manifest with mounted source and overlay count', async () => {
    const response = await GET()

    expect(response.status).toBe(200)

    const body = await response.json()

    expect(body).toMatchObject({
      source: 'mounted',
      overlayCount: 0,
    })
    expect(body.manifest).toBeTypeOf('object')
    expect(Array.isArray(body.manifest.services)).toBe(true)
  })
})
