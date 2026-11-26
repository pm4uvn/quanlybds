# Architecture

## Shape

Modular monolith, Next.js App Router, no microservices. All Phase 1 pages
are client components (the app is a personal, offline-first local tool for
now); route groups separate the authenticated app shell (`src/app/(app)/`)
from the root layout.

## Data layer

```
src/lib/storage.ts   generic localStorage-backed Collection<T> + pub/sub
src/lib/repo.ts       named collections (projects, properties, customers,
                      scores, swot, usp, import_jobs) + scoring-weights
                      key/value settings
src/lib/use-repo.ts   React hooks (useSyncExternalStore) over the repo —
                      this is the ONLY thing app code imports to read/write
                      data
```

This indirection is deliberate: swapping local demo mode for a Supabase
Postgres/Auth/Storage backend later means reimplementing `storage.ts`
(and the `repo.ts` accessor functions) behind the same function signatures.
No page or component should need to change.

## Domain model

`src/lib/types.ts` defines the Phase 1 entities (Project, Property,
Customer, ProductScore, SwotAnalysis, ProductUsp, ImportJob) plus shared
verification/status enums. Each carries `createdAt`/`updatedAt`, and
properties/projects carry per-field `SourceInfo` (status, source, last
verified) for the data-quality system described in the brief.

## Feature modules

- `lib/scoring.ts` — weighted score computation; explicitly tracks data
  coverage so a partial score is never confused with a complete one.
- `lib/completeness.ts` — per-property data-completeness percentage.
- `lib/excel.ts` — SheetJS-based import (template, parsing, Vietnamese
  label mapping, validation, duplicate detection) and export.
- `lib/dashboard.ts` / `lib/insights.ts` — pure functions deriving KPIs,
  chart data and rule-based insights from stored data (no fabrication).
- `lib/demo-data.ts` — deterministic fictional seed data, all tagged
  `isDemo: true` so it can be cleared independently of real agent data.

## UI

shadcn/ui (Radix primitives) + Tailwind v4 design tokens in
`src/app/globals.css` implementing the specified navy/emerald/gold palette.
Recharts for all dashboard/score visualizations. `src/components/layout/`
holds the app shell (desktop sidebar, mobile bottom nav + "more" sheet,
page header, coming-soon stub). Feature components live under
`src/components/{projects,products}/`.

## Why no cacheComponents

Next.js 16's experimental `cacheComponents` prerendering was disabled
(`next.config.ts`) because every page here reads client-only state
(localStorage) via hooks that are inherently dynamic (`usePathname`,
`useParams`, the repo hooks) — there is nothing meaningful to statically
prerender yet, and forcing it would require wrapping the entire app in
Suspense boundaries for no benefit at this stage.
