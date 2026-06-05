import type { LinkResolution } from '../../lib/manifest/link-policy'

export interface ServiceLinkState {
  href: string
  isDisabled: boolean
  target: '_blank' | '_self'
  tooltip: string
  buttonLabel: string
}

export function getServiceLinkState(primaryLink: LinkResolution): ServiceLinkState {
  const isDisabled = primaryLink.isUnavailable || !primaryLink.url
  const href = primaryLink.url ?? '#'

  return {
    href,
    isDisabled,
    target: isDisabled ? '_self' : '_blank',
    tooltip: isDisabled ? 'Link unavailable' : 'Open service link',
    buttonLabel: isDisabled ? 'unavailable' : 'open',
  }
}
