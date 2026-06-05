import { loadOverlayFromStorage, saveOverlayToStorage } from '../lib/overlay/storage'
import type { OverlayPayload, OverlayService } from '../lib/overlay/merge'

const OVERLAY_TEXT_ELEMENT_ID = 'overlay-export'

function textToPatch(form: HTMLFormElement): OverlayService | null {
  const serviceId = form.dataset.serviceId

  if (!serviceId) {
    return null
  }

  const formData = new FormData(form)
  const patch: OverlayService = { id: serviceId }
  const name = String(formData.get('name') ?? '').trim()
  const publicUrl = String(formData.get('publicUrl') ?? '').trim()
  const finalUrl = String(formData.get('finalUrl') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const visibility = String(formData.get('visibility') ?? '').trim()
  const orderRaw = String(formData.get('order') ?? '').trim()

  if (name) {
    patch.name = name
  }

  if (publicUrl) {
    patch.publicUrl = publicUrl
  } else {
    patch.publicUrl = 'unknown'
  }

  if (finalUrl) {
    patch.finalUrl = finalUrl
  } else {
    patch.finalUrl = null
  }

  if (description) {
    patch.description = description
  }

  if (visibility) {
    patch.visibility = visibility as OverlayService['visibility']
  }

  if (orderRaw) {
    const order = Number.parseInt(orderRaw, 10)

    if (!Number.isNaN(order) && order >= 0) {
      patch.order = order
    }
  }

  return patch
}

function normalizePayload(payload: OverlayPayload): OverlayPayload {
  const normalized: OverlayPayload = {
    version: payload.version,
    services: Array.isArray(payload.services)
      ? payload.services
          .filter((service) => typeof service?.id === 'string' && service.id.length > 0)
          .map((service) => {
            const patch = { ...service } as OverlayService

            if (patch.finalUrl === undefined) {
              return patch
            }

            if (patch.finalUrl === '') {
              patch.finalUrl = null
            }

            return patch
          })
      : [],
  }

  if (payload.version) {
    normalized.version = payload.version
  }

  return normalized
}

function writeOverlayPreview(payload: OverlayPayload): void {
  const target = document.getElementById(OVERLAY_TEXT_ELEMENT_ID)

  if (target) {
    target.textContent = JSON.stringify(payload, null, 2)
  }

  const overlayCount = document.getElementById('overlay-count')

  if (overlayCount) {
    overlayCount.textContent = String(Array.isArray(payload.services) ? payload.services.length : 0)
  }
}

function upsertOverlayService(payload: OverlayPayload, patch: OverlayService): OverlayPayload {
  const normalized = normalizePayload(payload)
  const services = [...(normalized.services ?? [])]
  const index = services.findIndex((entry) => entry.id === patch.id)

  if (index >= 0) {
    services[index] = {
      ...services[index],
      ...patch,
    }
  } else {
    services.push(patch)
  }

  return {
    ...normalized,
    services,
  }
}

function readPayloadFromForm(form: HTMLFormElement): OverlayPayload {
  const patch = textToPatch(form)

  if (!patch) {
    return loadOverlayFromStorage()
  }

  return upsertOverlayService(loadOverlayFromStorage(), patch)
}

function bindCopyTarget(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = button.dataset.copyTarget

      if (!target) {
        return
      }

      const source = document.getElementById(target)

      if (!source) {
        return
      }

      const text = source.textContent ?? ''

      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(text)
        button.textContent = 'copied'
        setTimeout(() => {
          button.textContent = 'Copy to clipboard'
        }, 1000)
      }
    })
  })
}

function bindCopySingle(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-service]').forEach((button) => {
    button.addEventListener('click', async () => {
      const serviceId = button.dataset.copyService

      if (!serviceId) {
        return
      }

      const form = document.querySelector<HTMLFormElement>(`[data-service-id="${serviceId}"]`)

      if (!form) {
        return
      }

      const payload = readPayloadFromForm(form)
      const entry = (payload.services ?? []).find((entry) => entry.id === serviceId)
      const text = JSON.stringify(entry ?? { id: serviceId }, null, 2)

      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(text)
        button.textContent = 'copied'
        setTimeout(() => {
          button.textContent = 'Copy entry'
        }, 900)
      }
    })
  })
}

function bindEditJump(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-edit-trigger]').forEach((button) => {
    button.addEventListener('click', () => {
      const serviceId = button.dataset.editTrigger

      if (!serviceId) {
        return
      }

      const panel = document.getElementById(serviceId)

      if (!panel || panel.tagName.toLowerCase() !== 'details') {
        return
      }

      panel.setAttribute('open', 'true')
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })
}

function bindSubmit(): void {
  document.querySelectorAll<HTMLFormElement>('.service-edit-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault()

      if (!textToPatch(form)) {
        return
      }

      const payload = readPayloadFromForm(form)
      saveOverlayToStorage(payload)
      writeOverlayPreview(payload)
      window.location.reload()
    })
  })
}

function bindSelectorJump(): void {
  const selector = document.getElementById('service-selector') as HTMLSelectElement | null

  if (!selector) {
    return
  }

  selector.addEventListener('change', () => {
    const id = selector.value

    if (!id) {
      return
    }

    const detail = document.getElementById(id)

    if (detail?.tagName.toLowerCase() === 'details') {
      detail.setAttribute('open', 'true')
      detail.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function init(): void {
  const payload = loadOverlayFromStorage()
  writeOverlayPreview(payload)

  bindCopyTarget()
  bindCopySingle()
  bindEditJump()
  bindSelectorJump()
  bindSubmit()
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
