import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  DASHBOARD_OVERLAY_KEY,
  OVERLAY_VERSION,
} from '../../src/lib/overlay/constants'
import {
  exportOverlayPayload,
  loadOverlayFromStorage,
  saveOverlayToStorage,
} from '../../src/lib/overlay/storage'
import type { OverlayPayload } from '../../src/lib/overlay/merge'

describe('overlay storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    const localStorageMock = {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value)
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key)
      }),
      clear: vi.fn(() => {
        store.clear()
      }),
      key: vi.fn(),
      length: 0,
    }

    vi.stubGlobal('localStorage', localStorageMock)
  })

  test('returns empty object when overlay key is missing', () => {
    const overlay = loadOverlayFromStorage()

    expect(overlay).toEqual({})
  })

  test('loads overlay JSON from localStorage when valid', () => {
    const raw = {
      version: OVERLAY_VERSION,
      services: [
        {
          id: 'svc-a',
          name: 'Overlay Name',
        },
      ],
    }

    localStorage.setItem(DASHBOARD_OVERLAY_KEY, JSON.stringify(raw))

    const overlay = loadOverlayFromStorage() as OverlayPayload

    expect(overlay.version).toBe(OVERLAY_VERSION)
    expect(overlay.services?.[0]?.id).toBe('svc-a')
    expect(overlay.services?.[0]?.name).toBe('Overlay Name')
  })

  test('returns {} and warns when localStorage JSON is malformed', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem(DASHBOARD_OVERLAY_KEY, '{ bad json }')

    const overlay = loadOverlayFromStorage()

    expect(overlay).toEqual({})
    expect(warnSpy).toHaveBeenCalled()
  })

  test('saveOverlayToStorage writes overlay payload JSON to localStorage', () => {
    const overlay: OverlayPayload = {
      version: OVERLAY_VERSION,
      services: [
        {
          id: 'svc-a',
          finalUrl: 'https://example.com',
        },
      ],
    }

    saveOverlayToStorage(overlay)

    const raw = localStorage.getItem(DASHBOARD_OVERLAY_KEY)
    expect(raw).toBe(exportOverlayPayload(overlay))
  })
})
