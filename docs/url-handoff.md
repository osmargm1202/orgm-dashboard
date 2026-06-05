# ORGM Dashboard URL handoff

## Scope
Task 12 final handoff for runtime URL resolution and deployment inputs.

## Acceptance status
- `publicUrl` placeholders stay unresolved in repository manifests (`"unknown"`).
- `finalUrl` placeholders stay unresolved in repository manifests (`null`).
- Dashboard has no in-app login UI.
- Access control is handled by Cloudflare layer (Access / Gateway / WAF / DNS-TLS).
- Internal links are shown with explicit caveat per policy (`internal-only link` / internal fallback path).

## Required mount contract
Runtime compose mounts (current implementation):

- `./config` -> `/app/dist/config:ro`
- `./assets` -> `/app/dist/config/assets:ro`

Keep both directories host-side for deployment portability. Do not commit host-specific URLs.

## Unresolved URL slots (source manifest)
Command run:

```bash
node - <<'PY'
const m=require('./public/config/dashboard.base.json');
const items=m.services.filter(s=>s.finalUrl===null||s.publicUrl==='unknown');
console.log('count='+items.length)
for (const s of items) {
  console.log(`${s.id}\t${s.publicUrl}\t${s.finalUrl}`)
}
PY
```

Current output (this repo snapshot): `count=26`.

Unresolved IDs:

dagendang-web
msg-orgm
filebrowser
librechat
nginx-proxy-manager
n8n
open-webui
uptime-kuma
pyload
dagendang-strapi
insforge
pihole
homepage
radisson-paneles
adminer
vaultwarden
healthchecks
immich-server
webodm-webapp
romm
registry
appsmith
dashy
twofa-auth
watchtower
orgm-nextjs

## Why unresolved
These remain `publicUrl: "unknown"` / `finalUrl: null` on purpose for environment-specific deployment. Fill only in copied `public/config/dashboard.base.json` used per host.

## Final human action required
- Replace unresolved `publicUrl` and `finalUrl` values in deployment copy of `public/config/dashboard.base.json`.
- Keep JSON valid.
- No login credentials or secrets in URL fields.
