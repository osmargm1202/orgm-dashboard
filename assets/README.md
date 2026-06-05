# ORGM Dashboard assets contract

## Purpose
`assets/` is portable visual/runtime surface for dashboard cards, logos, and optional branding files.

The planning goal is: **manifest-first + mounted volumes + export-safe content bundle**.

## Directory model
- `assets/logos/` — service logo files referenced by manifest (`.svg`, `.png`, `.webp`).
- `assets/icons/` — compact icons for list rows/cards.
- `assets/covers/` — optional hero/background images.
- `assets/badges/` — status/cluster/tenant chips (optional).
- `assets/theme/` — optional overrides (css tokens, palettes, backgrounds).

## Mount model (portable)
- Host path: `./assets`
- Container mount target: `/app/public/config/assets`
- Manifest references must stay relative, e.g. `assets/logos/dagendang.svg`.

This keeps the dashboard package data-driven and host-agnostic:
- copy `config/*.json`
- copy `assets/`
- same compose file runs on another host with near-zero changes.

## Runtime resolution
For each service entry in `dashboard.base.example.json`:
- `assetRef.logoRef` and `assetRef.iconRef` resolve against mounted public config asset root.
- If file missing:
  1. fallback to a default built-in icon,
  2. fallback to initials token.

## Export model
To export dashboard assets to another environment:
1. Zip `config/` and `assets/` together.
2. Import by replacing mount source on destination host.
3. Fill missing `finalUrl` / `publicUrl` in copied manifest.
4. Keep `.gitkeep` for empty folders if needed.

No secrets, tokens, passwords, or API keys in assets or manifest examples.
