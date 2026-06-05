export type Visibility =
  | 'public-candidate'
  | 'public'
  | 'internal-first'
  | 'internal-only'
  | 'infra-only'
  | 'infrastructure'
  | 'platform-core'
  | 'reference'

export interface UrlPort {
  host: string
  hostPort: number
  containerPort: number
  protocol: 'tcp' | 'udp'
}

export interface AssetRef {
  logoRef: string
  iconRef: string
  coverRef?: string
}

export interface ServiceRecord {
  id: string
  name: string
  description: string
  group: string
  containerName: string
  image: string
  status: 'running' | 'exited' | 'unknown'
  networks: string[]
  ports: UrlPort[]
  urlHints: string[]
  finalUrl: string | null
  publicUrl: string
  sameNetworkUrl?: string
  internalUrl?: string
  visibility: Visibility
  assetRef: AssetRef
}

export interface DashboardManifest {
  manifestVersion: string
  generatedAt: string
  project: string
  environment: string
  defaultUrlPolicy: 'placeholder' | 'manual'
  services: ServiceRecord[]
  generatedFrom?: string
}
