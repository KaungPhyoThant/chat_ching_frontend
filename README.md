# Medical Project Frontend

Next.js frontend for the medical/EMR project.

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

## Developer Guide

Read the frontend guide before adding features:

- [Frontend Developer Guide](docs/frontend-dev-guide.md)

It covers architecture, feature folder patterns, API/MSW usage, RBAC, logging, testing, security/PHI rules, and recommended improvements.

## Common Commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm verify
pnpm api:types
```

Run `pnpm verify` before commit/PR.
