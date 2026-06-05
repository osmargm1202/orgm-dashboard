import type { ServiceRecord } from '../manifest/types'

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type OverlayService = Omit<Partial<ServiceRecord>, 'id'> & {
  id: string
  order?: number
}

export interface OverlayPayload {
  version?: string
  services?: OverlayService[]
}

const isOverlayService = (entry: unknown): entry is OverlayService => {
  if (!isPlainObject(entry) || Object.prototype.hasOwnProperty.call(entry, 'id') === false) {
    return false
  }

  if (typeof entry.id !== 'string' || entry.id.length === 0) {
    return false
  }

  if (
    entry.order !== undefined &&
    (typeof entry.order !== 'number' || !Number.isInteger(entry.order) || entry.order < 0)
  ) {
    return false
  }

  return true
}

const mergeServiceWithOverlay = (base: ServiceRecord, patch: OverlayService): ServiceRecord => {
  const merged: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'id' || key === 'order') {
      continue
    }

    const current = base[key as keyof ServiceRecord]

    if (
      current !== null &&
      value !== null &&
      typeof current === 'object' &&
      typeof value === 'object' &&
      !Array.isArray(current) &&
      !Array.isArray(value)
    ) {
      merged[key] = {
        ...(current as unknown as Record<string, unknown>),
        ...(value as unknown as Record<string, unknown>),
      }
      continue
    }

    merged[key] = value
  }

  return merged as unknown as ServiceRecord
}

export function mergeManifestServices(baseServices: ServiceRecord[], overlay: OverlayPayload = {}): ServiceRecord[] {
  const overlayList = Array.isArray(overlay.services) ? overlay.services : []
  const validOverlays = overlayList.filter(isOverlayService)

  const overlayById = new Map<string, OverlayService>()
  const orderById = new Map<string, number>()

  for (const entry of validOverlays) {
    overlayById.set(entry.id, entry)

    if (entry.order !== undefined) {
      orderById.set(entry.id, entry.order)
    }
  }

  const baseIndex = new Map(baseServices.map((service, index) => [service.id, index]))

  const merged = baseServices.map((service) => {
    const patch = overlayById.get(service.id)

    if (!patch) {
      return service
    }

    return mergeServiceWithOverlay(service, patch)
  })

  const fallbackOrder = (id: string): number =>
    orderById.get(id) ?? (baseIndex.get(id) ?? baseServices.length)

  return merged.sort((left, right) => {
    const leftOrder = fallbackOrder(left.id)
    const rightOrder = fallbackOrder(right.id)

    if (leftOrder === rightOrder) {
      return (baseIndex.get(left.id) ?? 0) - (baseIndex.get(right.id) ?? 0)
    }

    return leftOrder - rightOrder
  })
}
