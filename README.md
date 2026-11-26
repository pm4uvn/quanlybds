# Realty360 — Real Estate Sales Intelligence Platform

Hiểu sản phẩm – Hiểu khách hàng – Bán hàng hiệu quả.

Phase 1 MVP: project management, product inventory, Excel import/export,
product scoring, SWOT, product comparison and data-quality tracking for
individual real estate agents. Runs entirely in **local demo mode** (browser
`localStorage`) — no backend required to try it out.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) ·
Recharts · React Hook Form + Zod · SheetJS (xlsx) · TanStack Table primitives.

Data persistence is behind a small repository abstraction
(`src/lib/storage.ts`, `src/lib/repo.ts`). Today it is backed by
`localStorage`; swapping in Supabase Postgres + Auth + Storage later only
means reimplementing that file — no app code needs to change.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app seeds itself with fictional demo data
(5 projects, 30 properties, 15 customers) on first load — all tagged as demo
and removable from **Cài đặt → Dữ liệu demo**.

```bash
npm run build   # production build + type check
npm run lint     # ESLint (incl. React Compiler purity rules)
```

## Environment variables

None required for the current local demo mode. When moving to a real backend:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, never exposed to the client |
| `AI_PROVIDER` / `AI_API_KEY` | Server-side AI provider for Phase 3 (Gemini/OpenAI/Anthropic) |

## Implemented (Phase 1)

- Responsive app shell: desktop sidebar + mobile bottom nav, Vietnamese UI,
  Realty360 design system (navy/emerald/gold palette, Be Vietnam Pro font).
- **Tổng quan**: KPI cards, 6 charts, rule-based "Smart Insights" computed
  from stored data only.
- **Dự án**: create/edit projects, tabbed detail page (overview, location,
  legal, sales policy, properties, documents).
- **Kho sản phẩm**: quick-add form (<2 min), card/table views, filters,
  search, sort, favorites, data-completeness indicator, Excel import
  (template, preview, duplicate detection, error report) and export.
- **Phân tích sản phẩm / product detail**: configurable weighted scoring
  with radar chart and explicit "insufficient data" handling, SWOT editor
  with approval step, USP/sales-script editor (reasons, objections,
  elevator pitch), legal/availability verification tracking with warnings.
- **So sánh**: compare 2–4 products, customer-facing print/export mode that
  hides internal fields (commission, notes).
- **Cài đặt**: scoring-weight configuration, demo-data reset.
- Phase 2–4 modules (Khách hàng, Ghép sản phẩm, Trợ lý bán hàng, Công cụ
  tài chính, Kiến thức) are visible in navigation, clearly marked **"Sắp
  có"**, and link to an honest roadmap page rather than a broken screen.

## Known limitations

- Persistence is local to the browser (no multi-device sync, no auth) —
  by design for this phase, per the local-demo-mode fallback.
- No automated test suite yet (see backlog).
- Document/image uploads are modeled in the data layer but there is no file
  storage backend wired up yet.
- AI features (Phase 3) are not implemented.

## Backlog / recommended next phase

Phase 2 — Customer Intelligence: customer CRM, Kanban pipeline, follow-up
tasks, smart customer↔product matching, and unit/integration/E2E test
coverage for the scoring and financial formulas introduced along the way.
