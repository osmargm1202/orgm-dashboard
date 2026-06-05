import type { DashboardManifest, ServiceRecord } from './types'

export function getServiceById(services: ServiceRecord[], id: string): ServiceRecord | undefined {
  return services.find((service) => service.id === id)
}

export function filterByVisibility(
  services: ServiceRecord[],
  allowed: Array<ServiceRecord['visibility']>,
): ServiceRecord[] {
  const allowedSet = new Set(allowed)

  return services.filter((service) => allowedSet.has(service.visibility))
}

export function groupedBySection(services: ServiceRecord[]): Record<string, ServiceRecord[]> {
  return services.reduce<Record<string, ServiceRecord[]>>((acc, service) => {
    if (!acc[service.group]) {
      acc[service.group] = []
    }

    acc[service.group].push(service)
    return acc
  }, {})
}

export type ManifestWithServices = Omit<DashboardManifest, 'services'> & {
  services: Array<ServiceRecord | null>
}

export function stripManifestMetadata(manifest: DashboardManifest): Omit<DashboardManifest, 'manifestVersion' | 'generatedAt' | 'project' | 'environment' | 'generatedFrom' | 'defaultUrlPolicy'> {
  return {
    services: manifest.services,
  } as Omit<
    DashboardManifest,
    'manifestVersion' | 'generatedAt' | 'project' | 'environment' | 'generatedFrom' | 'defaultUrlPolicy'
  >
}
