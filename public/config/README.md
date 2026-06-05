# ORGM Dashboard config contract

This folder is mounted from host into container runtime.

## Mount

- Host: `./config`
- Container: `/app/public/config`

Loader reads:

- `dashboard.base.json` at runtime
- `dashboard.base.example.json` as editable example/template

## URL fields

- `finalUrl`: final canonical URL for service in this environment
- `publicUrl`: user-facing public URL or `"unknown"`

Keep `finalUrl = null` and `publicUrl = "unknown"` in source/example templates. Fill both only in deployment copy.

## Security rule

No secrets, tokens, API keys, or credentials in these JSON files.
