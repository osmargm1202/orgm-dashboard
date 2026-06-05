# ORGM Dashboard config contract

This folder is mounted from host into container runtime.

## Mount

- Host: `./config`
- Container: `/app/dist/config`

Loader reads:

- `dashboard.base.json` at runtime
- `dashboard.base.example.json` as editable example/template

## URL fields and handoff

- `finalUrl`: final canonical URL for service in this environment.
- `publicUrl`: user-facing public URL or `"unknown"` while resolving.

Keep `finalUrl = null` and `publicUrl = "unknown"` in source/example templates.
Do not commit host-specific URLs in repository files.

### Fill-in checklist (per deployment)

- Open copied `public/config/dashboard.base.json` on target host.
- Replace unresolved `finalUrl` and `publicUrl` values.
- Prefer HTTPS public URLs.
- Re-run `npm run build` once in that environment if needed.

## Access control note

Dashboard has no native login UI. Expose publicly only behind Cloudflare layer (Access/Gateway/WAF/DNS-TLS) as needed.

## Internal link caveat

Some services may only be reachable in private network. UI labels and badges can indicate internal access paths:
- `internal-only link`
- `same-network` fallback (`sameNetworkUrl` / `internalUrl`)

Do not expose or validate those links as public URLs.

## Security rule

No secrets, tokens, API keys, or credentials in these JSON files.
