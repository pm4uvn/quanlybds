# Supabase setup

1. Open your Supabase project → **SQL Editor**.
2. Run `schema.sql` (creates enums, tables, indexes, `updated_at` triggers,
   and Row Level Security policies scoping every row to `owner_id = auth.uid()`).
3. *(Optional)* To try it with sample data: find your user id
   (**Authentication → Users**, or `select id, email from auth.users;`),
   paste it into the `v_owner` variable at the top of `seed.sql`, then run
   `seed.sql`.
4. Grab your project's API URL and anon key (**Project Settings → API**) —
   you'll need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (see the root `README.md`).

## About RLS

Every table has `owner_id uuid references auth.users(id) default auth.uid()`
and four policies (`select`/`insert`/`update`/`delete`) that only allow a
row when `owner_id = auth.uid()`. That means:

- Rows can only be read/written while signed in via Supabase Auth.
- Running `seed.sql` from the SQL editor bypasses RLS (it runs with the
  `postgres` role), which is why it needs an explicit `v_owner` — once your
  app is signed in as that user, it will see the seeded rows.
- This also means **the app code currently still reads/writes
  `localStorage`**, not Supabase — this schema only prepares the database
  side. Tell me if you'd like the app wired up to read/write Supabase
  instead (swapping `src/lib/storage.ts`), since that's a separate step.

## Table ↔ app type mapping

| Table | `src/lib/types.ts` |
| --- | --- |
| `projects`, `project_documents` | `Project`, `ProjectDocument` |
| `properties` | `Property` (nested `SourceInfo` fields flattened to `*_status`/`*_source`/`*_last_verified_at`/`*_verified_by`) |
| `product_scores` | `ProductScore` (one `score_*` column per criterion; `null` = no data yet, never treated as 0) |
| `swot_analyses` | `SwotAnalysis` |
| `product_usps` | `ProductUsp` (`objections` stored as `jsonb`) |
| `customers` | `Customer` (Phase 2 CRM — schema is ready ahead of the UI) |
| `import_jobs` | `ImportJob` |
