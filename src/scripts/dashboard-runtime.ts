import { loadDashboardManifest } from '../lib/manifest/loader'
import { resolveServiceAssets } from '../lib/assets/resolver'
import { resolveServicePrimaryLink } from '../lib/manifest/link-policy'
import { groupServices } from '../lib/services/grouping'
import { mergeManifestServices } from '../lib/overlay/merge'
import { loadOverlayFromStorage } from '../lib/overlay/storage'
import type { ServiceRecord } from '../lib/manifest/types'
import { getServiceLinkState } from '../components/dashboard/service-link-state'
import { getStatusBadge } from '../lib/services/health'
import { initOverlayEditor } from './overlay-editor'

type DashboardSeedSource = 'loading' | 'runtime' | 'error'

interface DashboardSeed {
  source: DashboardSeedSource
}

interface RenderService {
  service: ServiceRecord
  primaryLink: ReturnType<typeof resolveServicePrimaryLink>
  assets: ReturnType<typeof resolveServiceAssets>
}

const MANIFEST_PATH = '/config/dashboard.base.json'
const SECTION_ROOT_SELECTOR = '#dashboard-sections'
const MANIFEST_SOURCE_ID = 'manifest-source'
const MANIFEST_GENERATED_ID = 'manifest-generated-at'
const MANIFEST_ENV_ID = 'manifest-environment'
const SERVICE_COUNT_ID = 'manifest-service-count'
const OVERLAY_COUNT_ID = 'overlay-count'

function parseSeed(): DashboardSeed {
  const seedElement = document.getElementById('dashboard-data')

  if (!seedElement) {
    return { source: 'loading' }
  }

  try {
    const raw = JSON.parse(seedElement.textContent ?? '{}') as DashboardSeed

    if (raw?.source === 'loading' || raw?.source === 'runtime' || raw?.source === 'error') {
      return raw
    }
  } catch {
    return { source: 'loading' }
  }

  return { source: 'loading' }
}

function setTextById(id: string, value: string): void {
  const node = document.getElementById(id)

  if (node) {
    node.textContent = value
  }
}

function setDashboardMeta(options: {
  source: DashboardSeedSource
  generatedAt?: string
  environment?: string
  serviceCount?: number
  overlayCount?: number
}): void {
  setTextById(MANIFEST_SOURCE_ID, options.source)
  setTextById(MANIFEST_GENERATED_ID, options.generatedAt ?? '')
  setTextById(MANIFEST_ENV_ID, options.environment ?? '')
  if (typeof options.serviceCount === 'number') {
    setTextById(SERVICE_COUNT_ID, String(options.serviceCount))
  }
  if (typeof options.overlayCount === 'number') {
    setTextById(OVERLAY_COUNT_ID, String(options.overlayCount))
  }
}

function clearDashboardSections(): void {
  const root = document.querySelector<HTMLElement>(SECTION_ROOT_SELECTOR)

  if (root) {
    root.replaceChildren()
  }
}

function appendText(element: HTMLElement, text: string): void {
  element.appendChild(document.createTextNode(text))
}

function createServiceLink(primaryLink: RenderService['primaryLink'], serviceId: string, visibility: ServiceRecord['visibility']): HTMLElement {
  const container = document.createElement('div')
  container.className = 'service-card__links'

  const linkState = getServiceLinkState(primaryLink)

  if (linkState.isDisabled) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `link-badge ${primaryLink.badgeClass}`
    button.disabled = true
    button.dataset.serviceLink = serviceId
    button.title = linkState.tooltip
    button.setAttribute('aria-disabled', 'true')
    button.textContent = linkState.buttonLabel
    container.appendChild(button)
  } else {
    const anchor = document.createElement('a')
    anchor.href = linkState.href
    anchor.className = `link-badge ${primaryLink.badgeClass}`
    anchor.target = linkState.target
    anchor.rel = 'noopener noreferrer'
    anchor.dataset.serviceLink = serviceId
    anchor.title = linkState.tooltip
    anchor.setAttribute('aria-disabled', 'false')
    appendText(anchor, `${primaryLink.linkLabel} · `)
    appendText(anchor, primaryLink.url ?? '')
    container.appendChild(anchor)
  }

  const showInternalOnly = primaryLink.linkLabel === 'internal-only link'
  const showSameNetwork = primaryLink.linkLabel !== 'internal-only link' && (visibility === 'internal-first' || visibility === 'infra-only')

  if (showInternalOnly) {
    const span = document.createElement('span')
    span.className = 'hint-badge link-badge badge-internal'
    span.textContent = 'internal-only link'
    container.appendChild(span)
  }

  if (showSameNetwork) {
    const span = document.createElement('span')
    span.className = 'hint-badge link-badge badge-internal'
    span.textContent = 'same-network only'
    container.appendChild(span)
  }

  if (primaryLink.isInternal && !showInternalOnly) {
    const span = document.createElement('span')
    span.className = 'hint-badge link-badge badge-internal'
    span.textContent = 'internal path'
    container.appendChild(span)
  }

  return container
}

function createServiceCard(serviceView: RenderService): HTMLElement {
  const card = document.createElement('article')
  card.className = 'service-card'
  card.dataset.serviceId = serviceView.service.id

  const header = document.createElement('div')
  header.className = 'service-card__header'

  const fallbackFromInitials = serviceView.assets.logo.fallback === 'initials' || !serviceView.assets.logo.url
  if (fallbackFromInitials) {
    const initials = document.createElement('span')
    initials.className = 'service-card__initials'
    initials.textContent = serviceView.assets.initials
    header.appendChild(initials)
  } else {
    const image = document.createElement('img')
    image.className = 'service-card__logo'
    image.src = serviceView.assets.logo.url
    image.alt = ''
    image.loading = 'lazy'
    header.appendChild(image)
  }

  const headingWrap = document.createElement('div')

  const title = document.createElement('h3')
  title.textContent = serviceView.service.name

  const meta = document.createElement('p')
  meta.className = 'meta-row'
  appendText(meta, `${serviceView.service.id} · ${serviceView.service.containerName}`)

  headingWrap.appendChild(title)
  headingWrap.appendChild(meta)
  header.appendChild(headingWrap)

  const body = document.createElement('div')
  body.className = 'service-card__body'

  const status = getStatusBadge(serviceView.service.status)
  const statusBadge = document.createElement('span')
  statusBadge.className = `status-badge ${status.badgeClass}`
  statusBadge.textContent = status.label
  body.appendChild(statusBadge)

  const description = document.createElement('p')
  description.textContent = serviceView.service.description
  body.appendChild(description)

  body.appendChild(createServiceLink(serviceView.primaryLink, serviceView.service.id, serviceView.service.visibility))

  const actions = document.createElement('div')
  actions.className = 'service-card__actions'

  const editButton = document.createElement('button')
  editButton.type = 'button'
  editButton.textContent = 'Edit service'
  editButton.dataset.editTrigger = serviceView.service.id

  const copyButton = document.createElement('button')
  copyButton.type = 'button'
  copyButton.textContent = 'Copy entry'
  copyButton.dataset.copyService = serviceView.service.id

  actions.appendChild(editButton)
  actions.appendChild(copyButton)

  body.appendChild(actions)

  card.appendChild(header)
  card.appendChild(body)
  return card
}

function createServiceSection(title: string, services: RenderService[]): HTMLElement {
  const section = document.createElement('section')
  section.className = 'section'

  const panel = document.createElement('div')
  panel.className = 'panel'

  const heading = document.createElement('h2')
  heading.textContent = title
  panel.appendChild(heading)

  const grid = document.createElement('div')
  grid.className = 'service-grid'

  if (services.length === 0) {
    const fallback = document.createElement('p')
    fallback.textContent = 'No services in this section.'
    panel.appendChild(fallback)
  } else {
    for (const service of services) {
      grid.appendChild(createServiceCard(service))
    }

    panel.appendChild(grid)
  }

  section.appendChild(panel)
  return section
}

function createFieldRow(label: string, input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): HTMLLabelElement {
  const row = document.createElement('label')

  const caption = document.createElement('span')
  caption.textContent = label

  row.appendChild(caption)
  row.appendChild(input)

  return row
}

function createTextInput(name: string, value: string, type: string = 'text', placeholder = ''): HTMLInputElement {
  const input = document.createElement('input')
  input.name = name
  input.type = type
  input.value = value
  if (placeholder) {
    input.placeholder = placeholder
  }

  return input
}

function createTextArea(name: string, value: string, rows: number): HTMLTextAreaElement {
  const textarea = document.createElement('textarea')
  textarea.name = name
  textarea.rows = rows
  textarea.value = value

  return textarea
}

function createSelect(name: string, options: string[], selected: string): HTMLSelectElement {
  const select = document.createElement('select')
  select.name = name

  for (const optionValue of options) {
    const option = document.createElement('option')
    option.value = optionValue
    option.textContent = optionValue
    if (optionValue === selected) {
      option.selected = true
    }
    select.appendChild(option)
  }

  return select
}

function createOverlayPanel(service: ServiceRecord): HTMLElement {
  const details = document.createElement('details')
  details.className = 'service-edit-panel'
  details.dataset.serviceEdit = 'true'
  details.id = service.id

  const summary = document.createElement('summary')
  const summaryText = document.createElement('strong')
  summaryText.textContent = `${service.name} `
  summary.appendChild(summaryText)

  const extra = document.createElement('span')
  extra.textContent = `(${service.id})`
  summary.appendChild(extra)

  const form = document.createElement('form')
  form.className = 'service-edit-form'
  form.dataset.serviceId = service.id

  const publicUrlValue = service.publicUrl === 'unknown' ? '' : service.publicUrl

  const nameInput = createTextInput('name', service.name)
  const publicUrlInput = createTextInput('publicUrl', publicUrlValue, 'url', 'https://example.com')
  const finalUrlInput = createTextInput('finalUrl', service.finalUrl ?? '', 'url', 'https://example.com')
  const descriptionInput = createTextArea('description', service.description, 2)

  const visibilityOptions = [
    'public-candidate',
    'public',
    'internal-first',
    'internal-only',
    'infra-only',
    'infrastructure',
    'platform-core',
    'reference',
  ]
  const visibilityInput = createSelect('visibility', visibilityOptions, service.visibility)

  const orderInput = createTextInput('order', '', 'number')
  orderInput.min = '0'
  orderInput.step = '1'

  const actions = document.createElement('div')
  actions.className = 'service-card__actions'

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.textContent = 'Save override'

  const copyButton = document.createElement('button')
  copyButton.type = 'button'
  copyButton.className = 'button'
  copyButton.textContent = 'Copy payload'
  copyButton.dataset.copyService = service.id

  actions.appendChild(submit)
  actions.appendChild(copyButton)

  form.appendChild(createFieldRow('Name', nameInput))
  form.appendChild(createFieldRow('Public URL', publicUrlInput))
  form.appendChild(createFieldRow('Final URL', finalUrlInput))
  form.appendChild(createFieldRow('Description', descriptionInput))
  form.appendChild(createFieldRow('Visibility', visibilityInput))
  form.appendChild(createFieldRow('Order', orderInput))
  form.appendChild(actions)

  details.appendChild(summary)
  details.appendChild(form)

  return details
}

function renderGroups(services: RenderService[]): void {
  const grouped = groupServices(services.map((entry) => entry.service))
  const serviceById = new Map<string, RenderService>()

  for (const entry of services) {
    serviceById.set(entry.service.id, entry)
  }

  const sections = grouped.map((group) => ({
    section: group.section,
    services: group.services
      .map((service) => serviceById.get(service.id))
      .filter((entry): entry is RenderService => Boolean(entry)),
  }))

  const root = document.querySelector<HTMLElement>(SECTION_ROOT_SELECTOR)
  if (!root) {
    return
  }

  root.replaceChildren()

  for (const section of sections) {
    root.appendChild(createServiceSection(section.section, section.services))
  }
}

function renderOverlayEditor(services: ServiceRecord[]): void {
  const editor = document.getElementById('overlay-editor')
  if (!editor) {
    return
  }

  const selector = editor.querySelector<HTMLSelectElement>('#service-selector')
  const panel = editor.querySelector<HTMLElement>('.overlay-editor__panels')

  if (!selector || !panel) {
    return
  }

  selector.length = 0
  panel.replaceChildren()

  const placeholder = document.createElement('option')
  placeholder.value = ''
  placeholder.textContent = 'Select service'
  selector.appendChild(placeholder)

  for (const service of services) {
    const option = document.createElement('option')
    option.value = service.id
    option.textContent = service.name
    selector.appendChild(option)

    panel.appendChild(createOverlayPanel(service))
  }
}

function buildRenderServices(services: ServiceRecord[]): RenderService[] {
  return services.map((service) => ({
    service,
    primaryLink: resolveServicePrimaryLink(service),
    assets: resolveServiceAssets(service.assetRef, service.name),
  }))
}

function renderError(message: string): void {
  const root = document.querySelector<HTMLElement>(SECTION_ROOT_SELECTOR)
  if (!root) {
    return
  }

  clearDashboardSections()

  const panel = document.createElement('div')
  panel.className = 'panel'

  const text = document.createElement('p')
  text.textContent = message
  panel.appendChild(text)

  root.appendChild(panel)
}


async function bootstrap(): Promise<void> {
  const seed = parseSeed()
  const defaultManifestMeta = {
    source: seed.source,
    generatedAt: '',
    environment: '',
    serviceCount: 0,
    overlayCount: 0,
  }

  setDashboardMeta(defaultManifestMeta)

  try {
    const manifest = await loadDashboardManifest()
    const overlayPayload = loadOverlayFromStorage()
    const mergedServices = mergeManifestServices(manifest.services, overlayPayload)
    const mergedViews = buildRenderServices(mergedServices)

    renderGroups(mergedViews)
    renderOverlayEditor(mergedServices)
    initOverlayEditor()

    setDashboardMeta({
      source: 'runtime',
      generatedAt: manifest.generatedAt,
      environment: manifest.environment,
      serviceCount: mergedServices.length,
      overlayCount: Array.isArray(overlayPayload.services) ? overlayPayload.services.length : 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load manifest'
    renderError(`Cannot load dashboard manifest from ${MANIFEST_PATH}: ${message}`)
    setDashboardMeta({ source: 'error' })
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      void bootstrap()
    })
  } else {
    void bootstrap()
  }
}
