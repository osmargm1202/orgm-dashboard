# ORGM Dashboard design spec — 2026-06-04 (v1.2 draft)

**Status:** Approved design direction (pending final external URLs)  
**Scope update:** continue planning only; no Astro scaffold, no GitHub repo creation.

## Inputs
- `base.md` contains Docker discovery snapshot for remote host `10.0.0.13`.
- User-approved visual direction: **Corporate Atlas + Command Center style**.
- User requirement update: dashboard must consume a portable config-first manifest and asset pack from mounted public config volume.

## Goals
1. Build dashboard content from portable JSON manifest rather than hardcoded code.
2. Keep brand/UX in Corporate Atlas + Command Center language: terminal command density, status-first cards, high contrast dark system UI.
3. Enable live edit of service metadata from browser via `localStorage` overlay.
4. Keep dashboard publicly accessible without app auth; protect with Cloudflare layer.
5. Flag internal/same-network links clearly to avoid broken public navigation.

## Data-driven runtime model

### Source of truth
The dashboard reads service inventory from mounted JSON manifest.

- **Primary source:** `public/config/dashboard.base.json`
- **Default example:** `public/config/dashboard.base.example.json`
- **Transport:** static file read on app boot (SSG + runtime refresh path allowed).
- **Mutability:** read-only by container by default; all mutable edits are overlays from browser localStorage.

### Manifest location and portability
- Host-side source directory should be mount-point driven and portable:
  - Example mount: `./config:/app/public/config:ro`
- No generated file should be committed from host-specific details.
- Manifest is environment-specific with overridable placeholders (`finalUrl`, `publicUrl`).

### Overlay policy (localStorage)
- On load:
  1. read and parse base manifest.
  2. merge with optional browser overlays from key `orgm-dashboard:v1:overlay`.
- Local edits only affect the current browser/device.
- Overlay format: partial `services` objects keyed by `id` merged into base entries.
- Example overlays:
  - rename service
  - update `publicUrl`
  - reorder groups
  - toggle visibility
  - update quick links and notes
- Save/export overlay as JSON when needed for migration to other browsers.
- App must survive malformed overlays; invalid JSON falls back to base manifest.

## Network policy and link behavior

### Public entry requirement
- Dashboard itself: no native login UI.
- Access control and identity gating is handled in Cloudflare (Access / Gateway / WAF / DNS-TLS policies).
- App must not collect credentials.

### Same-network/corporate internal links caveat
- Each service record has at least:
  - `publicUrl` (to be filled when confirmed)
  - `finalUrl` (computed final exposure URL)
  - optional `sameNetworkUrl` / `internalUrl`
- Link behavior by policy:
  1. Prefer `publicUrl` when it is a resolvable public HTTPS URL and not private.
  2. Fallback to `finalUrl` only if explicitly set.
  3. Fallback to `sameNetworkUrl` only with explicit “internal-only” label.
- If a link is only internal, show a badge + tooltip: `internal-only link` and prevent accidental external confusion.
- For same-network-only endpoints, include copyable host/port block:
  - internal hostname
  - port
  - expected network (`nginx_proxy_network`, `*internal*`).

## Runtime constraints (from requirement)
- **No implementation changes** in this step.
- No GitHub repo creation in this cycle.
- No secrets in manifest (`env` values with credentials omitted in example).
- Keep file formats plain JSON + Markdown only.

## Asset + logo/branding model (planned)
Service assets must be portable with manifest, not baked into app binary.

- Default asset root: `/app/public/config/assets`
- Per-service references in manifest:
  - `logoRef`: `assets/logos/<id>.svg|png`
  - `iconRef`: `assets/icons/<id>.svg|png`
  - optional `coverRef`: `assets/covers/<id>.png`
- Missing asset fallback chain:
  1. `logoRef` from manifest
  2. fallback to built-in neutral icon
  3. fallback to text initials
- Assets are copied/updated by replacing mounted folder only.

## UI style system
Use Corporate Atlas + Command Center style envelope:
- dark, cool palette with command-blue accents
- compact card density, thin separators, status chips, dense tables
- monospace + sans pairing for labels and metrics
- command-style micro-interactions (subtle glow, hover, scanline-like dividers)
- priority-first grouping by system (`Public`, `Ops`, `Infra`, `Data`, `Tools`)

## Manifest fields (authoritative)
At minimum each service item in `dashboard.base.example.json` includes:
- `id` (stable machine key)
- `name`
- `description`
- `group`
- `containerName`
- `image`
- `status`
- `networks`
- `ports`
- `urlHints`
- `publicUrl`
- `finalUrl`
- `sameNetworkUrl`
- `visibility`
- `assetRef`

## Open items to resolve before implementation
1. Final public hostnames (fill `finalUrl` and `publicUrl`).
2. Decide whether to expose internal services (e.g., adminer, db proxy tools) behind Cloudflare tunnel or hide by default.
3. Decide final overlay export/import UX (auto-export file vs manual copy-to-clipboard).

## Artifact alignment
- This plan now binds to:
  - `config/dashboard.base.example.json` (discovered service manifest draft)
  - `assets/README.md` (asset volume/export contract)
  - `base.md` (discovery snapshot, no runtime mutation)

## Acceptance for this planning increment
- Spec file updated with new requirement blocks (manifest portability, overlay behavior, no-login Cloudflare, internal link caveat, style).
- Draft manifest file exists in config with services + placeholder `finalUrl` and `publicUrl`.
- Asset contract documented under `assets/README.md` with mount/export semantics.
