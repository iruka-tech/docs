# Megabat Docs

Private documentation repository for Megabat.

## Purpose

This repo separates documentation from the backend and web app repositories so it can be hosted independently at a future docs domain such as `docs.megabat.io` while the product repos remain private.

## Local development

```bash
pnpm install
pnpm docs:dev
```

## Production build

```bash
pnpm docs:build
pnpm docs:preview
```

## Hosting

Recommended production target: a third-party static host with private project controls and a custom domain such as `docs.megabat.io` once the domain is available.
