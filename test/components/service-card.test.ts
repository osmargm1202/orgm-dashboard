import { describe, expect, test } from 'vitest'
import { getServiceLinkState } from '../../src/components/dashboard/service-link-state'
import type { LinkResolution } from '../../src/lib/manifest/link-policy'

describe('service link behavior', () => {
  test('unavailable links are marked disabled', () => {
    const link: LinkResolution = {
      url: null,
      source: 'unavailable',
      isInternalOnly: false,
      isInternal: false,
      isUnavailable: true,
      linkLabel: 'unavailable',
      badgeClass: 'badge-unavailable',
    }

    const state = getServiceLinkState(link)

    expect(state.isDisabled).toBe(true)
    expect(state.buttonLabel).toBe('unavailable')
    expect(state.target).toBe('_self')
  })

  test('public links are enabled for service card actions', () => {
    const link: LinkResolution = {
      url: 'https://example.com',
      source: 'public',
      isInternalOnly: false,
      isInternal: false,
      isUnavailable: false,
      linkLabel: 'public',
      badgeClass: 'badge-public',
    }

    const state = getServiceLinkState(link)

    expect(state.isDisabled).toBe(false)
    expect(state.href).toBe('https://example.com')
    expect(state.target).toBe('_blank')
    expect(state.buttonLabel).toBe('open')
  })
})
