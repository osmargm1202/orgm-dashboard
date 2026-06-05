import type { AssetRef } from '../manifest/types'

const ASSET_ROOT = '/config/assets'

export const NEUTRAL_ASSET_ICON = '/favicon.svg'

export interface ResolvedAsset {
  url: string
  fallback: 'explicit' | 'neutral' | 'initials'
}

export interface ResolvedServiceAssets {
  logo: ResolvedAsset
  icon: ResolvedAsset
  cover?: ResolvedAsset
  initials: string
}

function normalizeRef(ref: string): string {
  return ref.trim().replace(/^\/+/, '')
}

function makeAssetUrl(ref: string): string {
  return `${ASSET_ROOT}/${normalizeRef(ref)}`
}

function resolveAsset(ref: string | undefined): ResolvedAsset {
  if (ref?.trim()) {
    return {
      url: makeAssetUrl(ref),
      fallback: 'explicit',
    }
  }

  return {
    url: NEUTRAL_ASSET_ICON,
    fallback: 'neutral',
  }
}

export function getInitials(name: string): string {
  const tokens = name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)

  if (tokens.length === 0) {
    return '??'
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase()
  }

  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase()
}

export function resolveServiceAssets(assetRef: AssetRef, name: string): ResolvedServiceAssets {
  const initials = getInitials(name)

  const logo = resolveAsset(assetRef.logoRef)
  const icon = resolveAsset(assetRef.iconRef)

  return {
    logo,
    icon,
    cover: assetRef.coverRef ? resolveAsset(assetRef.coverRef) : {
      url: NEUTRAL_ASSET_ICON,
      fallback: 'neutral',
    },
    initials,
  }
}

export function resolveAssetChain(ref: string | undefined, name: string): ResolvedAsset[] {
  const initials = getInitials(name)

  if (ref?.trim()) {
    return [
      {
        url: makeAssetUrl(ref),
        fallback: 'explicit',
      },
      {
        url: NEUTRAL_ASSET_ICON,
        fallback: 'neutral',
      },
      {
        url: initials,
        fallback: 'initials',
      },
    ]
  }

  return [
    {
      url: NEUTRAL_ASSET_ICON,
      fallback: 'neutral',
    },
    {
      url: initials,
      fallback: 'initials',
    },
  ]
}
