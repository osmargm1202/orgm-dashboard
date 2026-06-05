I'm using the writing-plans skill to create the implementation plan.

# ORGM Dashboard (Astro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public ORGM dashboard in Astro from mounted JSON manifest, with browser-only `localStorage` overlay editing and portable config/assets deployment.

**Architecture:** Use static/public manifest input plus runtime client overlay merge and pure presentational Astro views. Manifest parsing and URL policy are centralized in schema/service modules to keep UI components focused. Config and assets are mounted into the container at runtime for host portability.

**Tech Stack:**
- Astro (TypeScript)
- Zod (manifest + overlay validation)
- Vitest + jsdom
- Node 20+
- Docker + Docker Compose

---

## Scope and files

### Create / modify

- `docs/superpowers/plans/2026-06-04-orgm-dashboard-implementation.md`
- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `src/env.d.ts`
- `.gitignore`
- `.github/workflows/ci.yml`
- `public/config/dashboard.base.json`
- `public/config/dashboard.base.example.json`
- `public/config/assets-manifest.json` (optional validator output)
- `src/pages/index.astro`
- `src/pages/api/manifest.json.ts`
- `src/layouts/BaseLayout.astro`
- `src/components/layout/Header.astro`
- `src/components/layout/Footer.astro`
- `src/components/layout/ThemeTone.astro`
- `src/components/dashboard/DashboardShell.astro`
- `src/components/dashboard/ServiceGroup.astro`
- `src/components/dashboard/ServiceCard.astro`
- `src/components/dashboard/ServiceLinks.astro`
- `src/components/dashboard/StatusBadge.astro`
- `src/components/dashboard/VisibilityHint.astro`
- `src/components/dashboard/OverlayEditor.astro`
- `src/components/forms/ServiceEditPanel.astro`
- `src/components/forms/CopyableSnippet.astro`
- `src/lib/manifest/types.ts`
- `src/lib/manifest/schema.ts`
- `src/lib/manifest/loader.ts`
- `src/lib/manifest/compose.ts`
- `src/lib/manifest/link-policy.ts`
- `src/lib/overlay/constants.ts`
- `src/lib/overlay/storage.ts`
- `src/lib/overlay/merge.ts`
- `src/lib/overlay/errors.ts`
- `src/lib/assets/resolver.ts`
- `src/styles/tokens.css`
- `src/styles/commands.css`
- `src/styles/global.css`
- `assets/README.md` (update for deployment/mount/export)
- `Dockerfile`
- `docker-compose.yml`
- `compose.override.example.yml`
- `docker-compose.override.yml` (local helper)
- `test/manifest/schema.test.ts`
- `test/manifest/loader.test.ts`
- `test/manifest/url-policy.test.ts`
- `test/overlay/storage.test.ts`
- `test/overlay/merge.test.ts`
- `test/components/service-card.test.ts`

### Inputs from source docs

- `docs/superpowers/specs/2026-06-04-orgm-dashboard-design.md` (requirements and UX direction)
- `base.md` (service discovery and inventory)
- `config/dashboard.base.example.json` (base manifest draft)
- `assets/README.md` (asset references and portability constraints)

### URL policy constraint

- `finalUrl` values must remain `null` in template data.
- `publicUrl` values must remain `unknown` in template data until user supplies confirmed hostnames.

---

### Task 1: Initialize git and create public GitHub repo

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Verify tooling and auth**

Run:
```bash
node -v
npm -v
gh --version
gh auth status
```
Expected:
- Node/npm available.
- `gh` installed.
- Auth status shows active user (or explicit login instruction is needed before continuing).

- [ ] **Step 2: Initialize git and create initial branch**

Run:
```bash
git init
git branch -M main
git status --short
```
Expected:
- Clean repo state with only untracked project files.
- Branch is `main`.

- [ ] **Step 3: Create and add `.gitignore`**

Create `.gitignore`:
```gitignore
node_modules/
.dist/
dist/
.astro/
coverage/
.env
.env.local
.DS_Store
.vscode/
.idea/

```

- [ ] **Step 4: Create GitHub public repo and add remote**

Run:
```bash
gh repo create orgm-dashboard --public --source . --remote origin --push
git remote -v
```
Expected:
- `origin` points to GitHub HTTPS remote.

- [ ] **Step 5: Commit repository bootstrap**

Run:
```bash
git add .gitignore
git commit -m "chore: bootstrap git repository"
```
Expected:
- Commit `chore: bootstrap git repository` exists.

---

### Task 2: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `src/env.d.ts`

- [ ] **Step 1: Run Astro scaffold (no custom code execution now)**

Run:
```bash
npm create astro@latest . -- --template minimal --typescript
```
Expected:
- Base Astro files created.
- Project remains empty except generated skeleton.

- [ ] **Step 2: Add required scripts and dependencies in `package.json`**

Set scripts and deps:
```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "lint": "eslint .",
    "typecheck": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/dom": "^10.4.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.0.0",
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 3: Install dependencies and run baseline build**

Run:
```bash
npm install
npm run build
```
Expected:
- Build passes on skeleton app.

- [ ] **Step 4: Commit scaffold baseline**

Run:
```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src public
git commit -m "chore: scaffold Astro project"
```
Expected:
- Scaffold commit created.

---

### Task 3: Materialize mounted base manifest in `public/config`

**Files:**
- Create: `public/config/dashboard.base.json`
- Create: `public/config/dashboard.base.example.json`

- [ ] **Step 1: Copy source example into public runtime path**

Run:
```bash
mkdir -p public/config
cp config/dashboard.base.example.json public/config/dashboard.base.example.json
cp config/dashboard.base.example.json public/config/dashboard.base.json
```
Expected:
- Both files exist.
- `public/config/dashboard.base.json` is used by loader.

- [ ] **Step 2: Normalize placeholder URL fields to keep unresolved state**

Run:
```bash
python - <<'PY'
import json
from pathlib import Path
p = Path('public/config/dashboard.base.json')
manifest = json.loads(p.read_text())
for s in manifest.get('services', []):
    s['finalUrl'] = None
    s['publicUrl'] = 'unknown'
p.write_text(json.dumps(manifest, indent=2) + '\n')

# keep example copy aligned
Path('public/config/dashboard.base.example.json').write_text(json.dumps(manifest, indent=2) + '\n')
PY
```
Expected:
- All `finalUrl` are JSON `null`.
- All `publicUrl` are `unknown`.
- `dashboard.base.example.json` in root remains editable draft.

- [ ] **Step 3: Add checksum/guard step for required fields (optional guard)**

Run:
```bash
node -e "const f='public/config/dashboard.base.json';const m=require('fs').readFileSync(f,'utf8');JSON.parse(m);console.log('manifest ok')"
```
Expected:
- Prints `manifest ok`.

- [ ] **Step 4: Commit manifest copy baseline**

Run:
```bash
git add public/config/dashboard.base.json public/config/dashboard.base.example.json
git commit -m "chore: stage dashboard base manifest copy"
```
Expected:
- Manifest baseline commit created.

---

### Task 4: Build focused manifest schema modules

**Files:**
- Create: `src/lib/manifest/types.ts`, `src/lib/manifest/schema.ts`, `src/lib/manifest/loader.ts`, `src/lib/manifest/compose.ts`

- [ ] **Step 1: Define strict types in `src/lib/manifest/types.ts`**

```ts
export type Visibility = 'public-candidate' | 'public' | 'internal-first' | 'internal-only' | 'infra-only' | 'platform-core' | 'reference'
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
}
```

- [ ] **Step 2: Implement schema in `src/lib/manifest/schema.ts` using Zod**

- [ ] **Step 3: Add loader in `src/lib/manifest/loader.ts` using `fetch('/config/dashboard.base.json')`**

- [ ] **Step 4: Add helpers in `src/lib/manifest/compose.ts`**

Implementation list:
- `getServiceById(services, id)`
- `filterByVisibility(services, allowed)`
- `groupedBySection(services)`

- [ ] **Step 5: Add schema + loader tests**

Create:
- `test/manifest/schema.test.ts`
- `test/manifest/loader.test.ts`

Run:
```bash
npm run test -- test/manifest/schema.test.ts
npm run test -- test/manifest/loader.test.ts
```
Expected:
- Invalid manifests fail with clear Zod errors.
- Valid manifests parse and map service fields.

- [ ] **Step 6: Commit manifest data layer**

Run:
```bash
git add src/lib/manifest test/manifest
git commit -m "feat: add manifest schema and loader"
```
Expected:
- Data/schema stack committed and testable.

---

### Task 5: Implement localStorage overlay modules + tests (critical requirement)

**Files:**
- Create: `src/lib/overlay/constants.ts`, `src/lib/overlay/storage.ts`, `src/lib/overlay/merge.ts`, `src/lib/overlay/errors.ts`
- Create: `test/overlay/storage.test.ts`, `test/overlay/merge.test.ts`

- [ ] **Step 1: Define storage contract in `src/lib/overlay/constants.ts`**

```ts
export const DASHBOARD_OVERLAY_KEY = 'orgm-dashboard:v1:overlay'
export const OVERLAY_VERSION = 'v1'
```

- [ ] **Step 2: Implement `storage.ts` with safe parse fallback**

Requirements:
- Read from `localStorage.getItem(DASHBOARD_OVERLAY_KEY)`
- Return `{}` when key missing
- On JSON parse error return `{}` and `console.warn`
- Save merge payload via `localStorage.setItem`

- [ ] **Step 3: Implement `merge.ts` deep partial merge by `id` with visibility/order support**

Requirements:
- Base is authoritative for missing fields
- Overlay only applies matching `id` records
- Invalid overlay service entries dropped but valid entries merged

- [ ] **Step 4: Add error helpers in `src/lib/overlay/errors.ts`**

Required exports:
- `OverlayParseError`
- `normalizeOverlayError`

- [ ] **Step 5: Add overlay tests (failing-first):**

Run:
```bash
npm run test -- test/overlay/storage.test.ts
npm run test -- test/overlay/merge.test.ts
```
Expected initial failures for unimplemented modules.

- [ ] **Step 6: Write passing implementation and rerun tests**

Run:
```bash
npm run test -- test/overlay/storage.test.ts
npm run test -- test/overlay/merge.test.ts
```
Expected:
- Overlay parse fallback for malformed JSON passes.
- Merge order and partial object behavior passes.

- [ ] **Step 7: Commit overlay modules**

Run:
```bash
git add src/lib/overlay test/overlay
git commit -m "feat: implement overlay storage and merge layer"
```

---

### Task 6: Add URL policy and service filtering logic

**Files:**
- Create: `src/lib/manifest/link-policy.ts`, `src/lib/services/health.ts`, `src/lib/services/grouping.ts`

- [ ] **Step 1: Define link resolution rules in `src/lib/manifest/link-policy.ts`**

Pseudo-behavior:
1. prefer `publicUrl` if URL starts with `https://` and not private host
2. else if `finalUrl` set use it
3. else if `visibility` is internal-only use `sameNetworkUrl` and mark `internal-only link`
4. else fallback to `internalUrl`

- [ ] **Step 2: Add health status helper in `src/lib/services/health.ts`**

Map `status` strings to badge classes.

- [ ] **Step 3: Add grouping helper in `src/lib/services/grouping.ts`**

Group order: `Public`, `Ops`, `Infra`, `Tools`, `Internal`, `Reference`, `Security`, then `Other`.

- [ ] **Step 4: Add URL policy tests**

Create `test/manifest/url-policy.test.ts`.

Run:
```bash
npm run test -- test/manifest/url-policy.test.ts
```
Expected:
- Public link wins over internal fallback.
- Internal-only services are flagged.

- [ ] **Step 5: Commit link policy + services helpers**

Run:
```bash
git add src/lib/manifest src/lib/services test/manifest/url-policy.test.ts
git commit -m "feat: add link policy and service helpers"
```

---

### Task 7: Build dashboard data wiring and API endpoint

**Files:**
- Create: `src/pages/api/manifest.json.ts`
- Modify: `src/pages/index.astro`
- Create: `src/lib/assets/resolver.ts`

- [ ] **Step 1: Add `src/pages/api/manifest.json.ts` for debug export and health check endpoint**

Return:
- `{ manifest, overlayCount, source: 'mounted' }`

- [ ] **Step 2: Load base manifest and overlay in `src/pages/index.astro`**

Flow:
1. call `loadManifest()` server-side
2. emit structured payload to page script
3. merge overlay client-side in browser
4. pass groups and flags to components

- [ ] **Step 3: Implement asset resolver in `src/lib/assets/resolver.ts`**

Resolve `logoRef`, `iconRef`, `coverRef` by mount root `/config/assets` and fallback chain:
1. explicit asset
2. built-in neutral icon
3. text initials

- [ ] **Step 4: Add endpoint + rendering tests**

Run:
```bash
npm run test -- test/manifest/loader.test.ts
npm run test -- test/components/service-card.test.ts
```
Expected:
- Manifest endpoint and rendering payload shape test pass.

- [ ] **Step 5: Commit page/data wiring**

Run:
```bash
git add src/pages src/lib test/components
git commit -m "feat: connect manifest loading and page render path"
```

---

### Task 8: Build UI components for dashboard and overlay controls

**Files:**
- Create: `src/components/dashboard/DashboardShell.astro`
- Create: `src/components/dashboard/ServiceGroup.astro`
- Create: `src/components/dashboard/ServiceCard.astro`
- Create: `src/components/dashboard/ServiceLinks.astro`
- Create: `src/components/dashboard/StatusBadge.astro`
- Create: `src/components/dashboard/VisibilityHint.astro`
- Create: `src/components/dashboard/OverlayEditor.astro`
- Create: `src/components/forms/ServiceEditPanel.astro`
- Create: `src/components/forms/CopyableSnippet.astro`
- Modify: `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`

- [ ] **Step 1: Implement shell + section composition**

Create `DashboardShell.astro` with:
- group title
- grid layout
- service cards

- [ ] **Step 2: Implement service card component API**

`ServiceCard.astro` accepts:
- `service`, `primaryLink`, `linkLabel`, `isInternal`
- renders status + asset badge + quick notes

- [ ] **Step 3: Implement overlay editor entry points**

`OverlayEditor.astro` plus `ServiceEditPanel.astro` support editing:
- name
- publicUrl/finalUrl
- description
- visibility
- reorder by numeric order field

- [ ] **Step 4: Implement internal-link warning and badges**

Use `VisibilityHint.astro` with exact labels:
- `internal-only link`
- `same-network only`

- [ ] **Step 5: Add component tests**

Run:
```bash
npm run test -- test/components/service-card.test.ts
```
Expected:
- Card renders with fallback icon when asset missing.
- Internal link warnings appear correctly.

- [ ] **Step 6: Commit UI foundation**

Run:
```bash
git add src/components
git commit -m "feat: add dashboard and overlay UI components"
```

---

### Task 9: Styling and theme system

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/commands.css`, `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add global token system in `src/styles/tokens.css`**

Define:
- background surface shades
- command-blue accents
- border glow tokens
- status colors for running/unknown/error

- [ ] **Step 2: Add visual language in `src/styles/commands.css`**

Add thin separators, compact spacing, hover glow, monospace accents, status chips.

- [ ] **Step 3: Wire styles in `src/styles/global.css` and base layout**

Set default font stack, body background, card shadows, badge contrast.

- [ ] **Step 4: Add optional local theme toggle component usage**

`src/components/layout/ThemeTone.astro` present but default locked to dark mode.

- [ ] **Step 5: Snapshot smoke style checks**

Run:
```bash
npm run build
```
Expected:
- Build compiles with all imported style sheets.

- [ ] **Step 6: Commit theme layer**

Run:
```bash
git add src/styles src/layouts
git commit -m "style: implement dashboard theme tokens and command-center look"
```

---

### Task 10: Update asset docs and export procedure

**Files:**
- Modify: `assets/README.md`

- [ ] **Step 1: Expand `assets/README.md` with export matrix**

Add section with commands:
- `tar -czf dashboard-bundle.tgz config assets`
- `tar -xzf dashboard-bundle.tgz -C /opt/orgm-dashboard`
- keep `.gitkeep` for empty folders

- [ ] **Step 2: Add verification checklist for missing assets**

Document script idea:
- compare manifest asset refs to file existence under `assets/`

- [ ] **Step 3: Add mount contract examples**

Include explicit table:
- `./config` -> `/app/public/config`
- `./assets` -> `/app/public/config/assets`

- [ ] **Step 4: Commit docs update**

Run:
```bash
git add assets/README.md
git commit -m "docs: finalize asset mount and export contract"
```

---

### Task 11: Dockerfile + Compose with mounted config and assets

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `compose.override.example.yml`
- Optional: `docker-compose.override.yml`

- [ ] **Step 1: Create production `Dockerfile`**

Use multi-stage:
1. `node:20-alpine` deps
2. `npm ci`
3. `npm run build`
4. run `npm run preview -- --host 0.0.0.0 --port 4321`

- [ ] **Step 2: Add `docker-compose.yml` with mounts and health check**

Compose service example:
```yaml
services:
  orgm-dashboard:
    build: .
    ports:
      - "4321:4321"
    volumes:
      - ./config:/app/public/config:ro
      - ./assets:/app/public/config/assets:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4321/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

- [ ] **Step 3: Add optional override file**

Create `compose.override.example.yml` with host folder mount hints and optional labels.

- [ ] **Step 4: Add compose smoke test and validation**

Run:
```bash
docker compose config
docker compose up -d --build
docker compose logs -f --tail=80
```
Expected:
- Config renders correctly.
- Container serves app at port 4321.
- No port/proxy conflicts in startup logs.

- [ ] **Step 5: Commit container scaffolding**

Run:
```bash
git add Dockerfile docker-compose.yml compose.override.example.yml
git commit -m "build: add Dockerfile and compose with mounted config/assets"
```

---

### Task 12: Verification and final URL handoff

- [ ] **Step 1: Full local verification loop**

Run:
```bash
npm run lint
npm run test
npm run build
```
Expected:
- No lint errors.
- All tests pass, including malformed overlay fallback tests.
- Build passes.

- [ ] **Step 2: Launch dashboard and verify runtime behavior manually**

Run:
```bash
npm run dev
```
Checklist:
- dashboard loads with services from `public/config/dashboard.base.json`
- cards show fallback icon when missing asset
- internal-only indicators present
- localStorage overlay controls save and rehydrate after reload
- malformed overlay does not crash

- [ ] **Step 3: User URL fill-in task (required manual fill for `finalUrl`/`publicUrl`)**

Run:
```bash
node -e "const m=require('./public/config/dashboard.base.json');const items=m.services.filter(s=>s.finalUrl===null||s.publicUrl==='unknown');console.log(items.map(s=>`${s.id}\t${s.publicUrl}\t${s.finalUrl}`).join('\n'))"
```
Expected:
- List of unresolved services printed.
- Replace `publicUrl` (unknown) and `finalUrl` (null) with confirmed hostnames.
- Re-run Task 12 Step 1 after edits.

- [ ] **Step 4: Publish verification outputs in handoff note**

- Commit final URLs JSON change only.
- Share final screenshot and checklist in PR note.

- [ ] **Step 5: Final implementation commit bundle and push**

Run:
```bash
git status
git push -u origin main
```
Expected:
- Clean status before push.
- Branch published.

---

## Self-review

- [ ] Spec coverage check: each requirement from `docs/superpowers/specs/2026-06-04-orgm-dashboard-design.md` mapped to a task.
- [ ] No placeholder words (`TODO`, `TBD`, `implement later`, etc.).
- [ ] File paths and command expectations are concrete.
- [ ] Overlay tests include parse fallback + merge behavior.
- [ ] Docker mounts include both config and assets roots.

## Execution options

**Plan complete and saved to `docs/superpowers/plans/2026-06-04-orgm-dashboard-implementation.md`.**

**1. Subagent-Driven (recommended):** dispatch fresh subagent per task and review between tasks.
**2. Inline Execution:** use `superpowers:executing-plans` and run batch with checkpoints.
