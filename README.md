# Iruka Docs

Documentation repository for Iruka.

## Purpose

This repo separates documentation from the backend and web app repositories so it can be hosted independently at `docs.iruka.tech` while the product repos stay decoupled.

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

Recommended production target: Vercel or another static host with a custom domain such as `docs.iruka.tech`.
