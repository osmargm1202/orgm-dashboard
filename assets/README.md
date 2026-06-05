# ORGM Dashboard assets contract

Portable assets for `orgm-dashboard` live in this folder and are mounted at runtime under `/app/public/config/assets`.

## Purpose

- Keep branding and card artwork outside app bundle.
- Keep deployment portable across hosts (copy `config/` + `assets/` only).
- Keep manifest references stable (`manifest.assetRef` points to relative paths).

## Directory contract

- `assets/logos/` — service logos (`.svg`, `.png`, `.webp`, etc.)
- `assets/icons/` — compact icons for cards/lists
- `assets/covers/` — optional hero/cover images
- `assets/badges/` — optional badge chips and tokens
- `assets/theme/` — optional theme/skin overrides

## Mount contract

| Host path | Container path | Purpose |
| --- | --- | --- |
| `./config` | `/app/public/config` | Config files (`dashboard.base.json`, examples, generated outputs) |
| `./assets` | `/app/public/config/assets` | All asset payload referenced by manifest |

- Container root for resolver is `/config/assets` in runtime image, so references are written as e.g. `assets/logos/orgm.svg`.
- Manifest refs must stay **relative**; never store absolute host paths in `assetRef`.

## Export and import matrix

### Export bundle

```bash
tar -czf dashboard-bundle.tgz config assets
```

### Import on destination host

```bash
mkdir -p /opt/orgm-dashboard
tar -xzf dashboard-bundle.tgz -C /opt/orgm-dashboard
```

Keep folder structure as-is. If you only need one of them, export both and mount both in compose.

## Deployment steps

1. Copy bundle to destination host.
2. Extract bundle.
3. Fill `public/config/dashboard.base.json` URLs for target host (see next section).
4. Start dashboard with the same mount contract.
5. Verify assets appear by opening a card with explicit refs.

## URL fill-in (final URL + public URL)

In source manifests, `finalUrl` and `publicUrl` are placeholders.

- `finalUrl` = final runtime URL in deployment host.
- `publicUrl` = optional manually confirmed public URL (`unknown` if not yet known).

Fill them per host in copied `dashboard.base.json`:

```json
{
  "id": "dagendang-web",
  "finalUrl": "https://dashboard.orgm.local",
  "publicUrl": "https://portal.orgm.example"
}
```

Rules:

- `finalUrl` must be host final URL or `null`.
- `publicUrl` must be concrete `https://...` URL or `"unknown"`.
- Do not write secrets in either URL field.

No secrets, tokens, API keys, or passwords in manifest or asset files.

## Verification checklist

- Ensure every referenced file exists:

```bash
python - <<'PY'
import json
from pathlib import Path

manifest = json.loads(Path('public/config/dashboard.base.json').read_text())
missing = []

for service in manifest.get('services', []):
    ref = service.get('assetRef', {})
    name = service.get('name', service.get('id', 'service'))

    for key in ['logoRef', 'iconRef', 'coverRef']:
        value = ref.get(key)
        if not value:
            continue
        path = Path('assets') / value
        if not path.exists():
            missing.append((name, key, str(path)))

if missing:
    print('Missing asset files:')
    for row in missing:
        print(f'- {row[0]} :: {row[1]} -> {row[2]}')
    raise SystemExit(1)

print('Asset references validated OK')
PY
```

- Keep placeholders for empty dirs to preserve empty mount structure:
  - `assets/logos/.gitkeep`
  - `assets/icons/.gitkeep`
  - `assets/covers/.gitkeep`
  - `assets/badges/.gitkeep`
  - `assets/theme/.gitkeep`

- If export destination differs, rerun check against mounted path after deployment.

## Asset safety

- Only add source-safe files.
- Never commit binaries from external vendors without source notice.
- Keep filenames deterministic and aligned with service IDs (`assets/logos/<service-id>.svg`).
