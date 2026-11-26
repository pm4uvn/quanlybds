# Implementation Plan

## Phase 1 — Product Intelligence MVP (this build — done)

- [x] App shell, responsive nav, design system
- [x] Dashboard (KPIs, charts, smart insights)
- [x] Project management (CRUD + tabbed detail)
- [x] Product inventory (CRUD, quick-add, card/table, filters, favorites)
- [x] Excel import (template/preview/validation/duplicates) + export
- [x] Product scoring (configurable weights, radar, coverage/confidence)
- [x] SWOT analysis (editable, approval step)
- [x] USP / sales script editor (reasons, objections, elevator pitch)
- [x] Product comparison (2–4 products, customer-facing export)
- [x] Data-quality tracking (verification status, staleness warnings)
- [x] Demo data (5 projects / 30 properties / 15 customers) + clear action
- [x] Phase 2–4 nav items marked "Sắp có" with an honest roadmap page

## Phase 2 — Customer Intelligence (next)

- Customer CRM (fields per brief §11), Kanban + list pipeline views
- Follow-up tasks and the "Hôm nay tôi cần làm gì?" daily workspace
- Smart customer↔product matching (hard constraints + weighted score)
- Customer-facing comparison reports reused from Phase 1's export mode
- First automated tests: scoring/matching unit tests, property CRUD and
  Excel import integration tests

## Phase 3 — AI Sales Intelligence

- Server-side AI provider abstraction (Gemini/OpenAI/Anthropic), grounded
  in stored product data, never sending unnecessary customer PII
- Product Q&A, sales script generator, objection handling, AI roleplay
- Financial calculators (loan, rental yield, sensitivity analysis)
- Sales Academy (lessons, flashcards, quizzes)

## Phase 4 — SaaS Expansion

- Multi-agent collaboration, organizations, shared inventory, subscriptions

## Migration note (local demo mode → Supabase)

Reimplement `src/lib/storage.ts` against Supabase Postgres (tables mirror
`src/lib/types.ts`), move auth into Supabase Auth, and point file fields
(`images`, `documents`) at Supabase Storage. `src/lib/repo.ts` and
`src/lib/use-repo.ts` are the only files whose internals change; everything
above them should be unaffected if their function signatures are preserved.
