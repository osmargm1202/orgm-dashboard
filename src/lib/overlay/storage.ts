import { DASHBOARD_OVERLAY_KEY, OVERLAY_VERSION } from './constants'
import { normalizeOverlayError } from './errors'
import type { OverlayPayload } from './merge'

const ensureOverlayPayload = (payload: OverlayPayload): OverlayPayload => ({
  ...payload,
  services: payload.services ?? [],
  version: OVERLAY_VERSION,
})

const hasLocalStorage = (): boolean => {
  return typeof globalThis.localStorage !== 'undefined'
}

export function loadOverlayFromStorage(): OverlayPayload {
  if (!hasLocalStorage()) {
    return {}
  }

  const raw = localStorage.getItem(DASHBOARD_OVERLAY_KEY)

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as OverlayPayload
  } catch (error) {
    const overlayError = normalizeOverlayError(error)
    console.warn(overlayError.message)

    return {}
  }
}

export function saveOverlayToStorage(payload: OverlayPayload): void {
  if (!hasLocalStorage()) {
    return
  }

  const normalized = ensureOverlayPayload(payload)
  localStorage.setItem(DASHBOARD_OVERLAY_KEY, exportOverlayPayload(normalized))
}

export function exportOverlayPayload(payload: OverlayPayload): string {
  const normalized = ensureOverlayPayload(payload)

  return JSON.stringify(normalized)
}
