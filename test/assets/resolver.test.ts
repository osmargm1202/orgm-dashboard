import { describe, expect, test } from 'vitest'
import { NEUTRAL_ASSET_ICON, resolveAssetChain, resolveServiceAssets } from '../../src/lib/assets/resolver'
import type { AssetRef } from '../../src/lib/manifest/types'

describe('asset resolver', () => {
  test('resolveServiceAssets keeps explicit refs', () => {
    const assetRef: AssetRef = {
      logoRef: 'assets/logos/example.svg',
      iconRef: 'assets/icons/example.svg',
    }

    const resolved = resolveServiceAssets(assetRef, 'Example Service')

    expect(resolved.logo.url).toBe('/config/assets/assets/logos/example.svg')
    expect(resolved.icon.url).toBe('/config/assets/assets/icons/example.svg')
  })

  test('resolveServiceAssets falls back to neutral icon and initials', () => {
    const assetRef: AssetRef = {
      logoRef: '',
      iconRef: '',
    }

    const resolved = resolveServiceAssets(assetRef, 'Jane Doe')

    expect(resolved.logo.fallback).toBe('neutral')
    expect(resolved.logo.url).toBe(NEUTRAL_ASSET_ICON)
    expect(resolved.initials).toBe('JD')
  })

  test('resolveAssetChain exposes explicit then neutral then initials', () => {
    const chain = resolveAssetChain('assets/logos/example.svg', 'Jane Doe')

    expect(chain).toHaveLength(3)
    expect(chain[0].url).toBe('/config/assets/assets/logos/example.svg')
    expect(chain[0].fallback).toBe('explicit')
    expect(chain[1].fallback).toBe('neutral')
    expect(chain[2].fallback).toBe('initials')
  })
})
