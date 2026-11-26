-- Realty360 — Phase 1 database schema for Supabase (PostgreSQL)
--
-- Mirrors the domain model in src/lib/types.ts. Each business table carries
-- an `owner_id` referencing auth.users so Row Level Security can scope every
-- row to the agent who owns it — this also sets up Phase 4's multi-agent
-- expansion without a schema change (owner_id just becomes "created_by").
--
-- Run this once in the Supabase SQL editor (or `supabase db push` if you
-- keep it under supabase/migrations). Safe to re-run: every statement is
-- guarded with IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================================
-- Enums
-- ============================================================================
do $$ begin
  create type verification_status as enum ('verified', 'unverified', 'outdated', 'missing', 'conflicting');
exception when duplicate_object then null; end $$;

do $$ begin
  create type legal_status as enum ('verified', 'pending', 'unverified', 'issue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_type as enum ('can_ho', 'nha_pho', 'biet_thu', 'dat_nen', 'shophouse', 'khu_do_thi', 'khac');
exception when duplicate_object then null; end $$;

do $$ begin
  create type construction_status as enum ('planning', 'under_construction', 'completed', 'handed_over');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_type as enum ('can_ho', 'nha_pho', 'biet_thu', 'dat_nen', 'shophouse', 'nha_rieng_le', 'cho_thue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('sale', 'rent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type direction as enum ('dong', 'tay', 'nam', 'bac', 'dong_bac', 'dong_nam', 'tay_bac', 'tay_nam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type furnishing_status as enum ('tho', 'co_ban', 'day_du', 'cao_cap');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_status as enum ('available', 'on_hold', 'reserved', 'sold', 'unavailable', 'pending_verification');
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_purpose as enum ('mua_de_o', 'mua_cho_gia_dinh', 'dau_tu_tang_gia', 'dau_tu_cho_thue', 'giu_tai_san', 'kinh_doanh');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pipeline_stage as enum ('new_lead', 'qualified', 'consulting', 'viewing', 'negotiation', 'reservation', 'closed_won', 'closed_lost');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- projects
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  name text not null,
  developer text not null,
  project_type project_type not null default 'can_ho',
  address text not null,
  province text not null,
  district text not null,
  lat double precision,
  lng double precision,
  description text,
  construction_status construction_status not null default 'under_construction',
  expected_handover date,
  total_area numeric,
  total_units integer,
  construction_density numeric,
  images text[] not null default '{}',

  -- location
  distance_to_center_km numeric,
  nearby_schools text,
  nearby_hospitals text,
  nearby_shopping text,
  public_transport text,
  main_roads text,
  employment_centers text,
  existing_infrastructure text,
  planned_infrastructure text,
  location_advantages text,
  location_disadvantages text,

  -- legal
  land_use_docs text,
  construction_permit text,
  ownership_type text,
  ownership_duration text,
  sales_eligibility_docs text,
  legal_verification_status verification_status not null default 'missing',
  legal_verification_source text,
  legal_verification_last_verified_at timestamptz,
  legal_verification_verified_by text,

  -- commercial
  starting_price numeric,
  avg_price_per_m2 numeric,
  payment_policy text,
  bank_financing_policy text,
  promotion_policy text,
  commission_policy text,
  management_fee numeric,
  maintenance_fee numeric,

  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_id_idx on public.projects(owner_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function set_updated_at();

-- ============================================================================
-- project_documents
-- ============================================================================
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  category text not null check (category in ('brochure', 'legal', 'payment_policy', 'other')),
  storage_path text, -- Supabase Storage object path
  uploaded_at timestamptz not null default now()
);

create index if not exists project_documents_project_id_idx on public.project_documents(project_id);

-- ============================================================================
-- properties
-- ============================================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid references public.projects(id) on delete set null,

  name text not null,
  property_type property_type not null default 'can_ho',
  transaction_type transaction_type not null default 'sale',

  block text,
  floor text,
  unit_number text,

  land_area numeric,
  usable_area numeric,
  bedrooms integer,
  bathrooms integer,
  direction direction,
  balcony_direction direction,
  view text,
  furnishing furnishing_status,

  listing_price numeric,
  discount numeric,
  final_price numeric,
  price_area_basis text check (price_area_basis in ('land', 'usable')),
  estimated_fees numeric,
  rental_price numeric,
  payment_policy text,
  commission_rate numeric,

  owner_source text,
  description text,
  advantages text,
  disadvantages text,
  images text[] not null default '{}',
  floor_plan text,

  legal_status legal_status not null default 'unverified',
  legal_source_status verification_status not null default 'missing',
  legal_source_source text,
  legal_source_last_verified_at timestamptz,
  legal_source_verified_by text,

  availability_source_status verification_status not null default 'unverified',
  availability_source_source text,
  availability_source_last_verified_at timestamptz,
  availability_source_verified_by text,

  status property_status not null default 'available',
  tags text[] not null default '{}',
  notes text,

  is_favorite boolean not null default false,
  is_demo boolean not null default false,
  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_verified_at timestamptz
);

create index if not exists properties_owner_id_idx on public.properties(owner_id);
create index if not exists properties_project_id_idx on public.properties(project_id);
create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_property_type_idx on public.properties(property_type);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function set_updated_at();

-- ============================================================================
-- product_scores (one row per property)
-- ============================================================================
create table if not exists public.product_scores (
  property_id uuid primary key references public.properties(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  weight_location numeric not null default 20,
  weight_price numeric not null default 20,
  weight_legal numeric not null default 20,
  weight_amenities numeric not null default 10,
  weight_livability numeric not null default 10,
  weight_investment numeric not null default 10,
  weight_liquidity numeric not null default 10,

  -- null = "no data yet" (never treated as 0 when computing the weighted score)
  score_location numeric check (score_location between 0 and 100),
  score_price numeric check (score_price between 0 and 100),
  score_legal numeric check (score_legal between 0 and 100),
  score_amenities numeric check (score_amenities between 0 and 100),
  score_livability numeric check (score_livability between 0 and 100),
  score_investment numeric check (score_investment between 0 and 100),
  score_liquidity numeric check (score_liquidity between 0 and 100),

  evaluated_at timestamptz not null default now()
);

create index if not exists product_scores_owner_id_idx on public.product_scores(owner_id);

-- ============================================================================
-- swot_analyses (one row per property)
-- ============================================================================
create table if not exists public.swot_analyses (
  property_id uuid primary key references public.properties(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  opportunities text[] not null default '{}',
  threats text[] not null default '{}',

  approved boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists swot_analyses_owner_id_idx on public.swot_analyses(owner_id);

drop trigger if exists swot_analyses_set_updated_at on public.swot_analyses;
create trigger swot_analyses_set_updated_at
  before update on public.swot_analyses
  for each row execute function set_updated_at();

-- ============================================================================
-- product_usps (one row per property) — sales scripts & objection handling
-- ============================================================================
create table if not exists public.product_usps (
  property_id uuid primary key references public.properties(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  top_reasons text[] not null default '{}',
  competitive_advantages text[] not null default '{}',
  differentiation text,
  ideal_customers text[] not null default '{}',
  not_suitable_for text[] not null default '{}',
  -- array of { "objection": string, "response": string }
  objections jsonb not null default '[]',
  elevator_pitch text,

  updated_at timestamptz not null default now()
);

create index if not exists product_usps_owner_id_idx on public.product_usps(owner_id);

drop trigger if exists product_usps_set_updated_at on public.product_usps;
create trigger product_usps_set_updated_at
  before update on public.product_usps
  for each row execute function set_updated_at();

-- ============================================================================
-- customers (Phase 2 CRM — schema ready ahead of the UI)
-- ============================================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  full_name text not null,
  phone text,
  email text,
  budget_min numeric,
  budget_max numeric,
  purpose customer_purpose not null default 'mua_de_o',
  preferred_location text,
  preferred_property_type property_type,
  min_area numeric,
  min_bedrooms integer,
  essential_requirements text,
  timeline text,
  notes text,
  stage pipeline_stage not null default 'new_lead',
  next_follow_up_date date,
  last_contact_date date,

  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_owner_id_idx on public.customers(owner_id);
create index if not exists customers_stage_idx on public.customers(stage);
create index if not exists customers_next_follow_up_date_idx on public.customers(next_follow_up_date);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function set_updated_at();

-- ============================================================================
-- import_jobs — Excel import audit trail
-- ============================================================================
create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),

  file_name text not null,
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  -- array of { "row": number, "field": string, "message": string }
  errors jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists import_jobs_owner_id_idx on public.import_jobs(owner_id);

-- ============================================================================
-- Row Level Security — every row is scoped to its owner
-- ============================================================================
alter table public.projects enable row level security;
alter table public.project_documents enable row level security;
alter table public.properties enable row level security;
alter table public.product_scores enable row level security;
alter table public.swot_analyses enable row level security;
alter table public.product_usps enable row level security;
alter table public.customers enable row level security;
alter table public.import_jobs enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'projects', 'project_documents', 'properties', 'product_scores',
    'swot_analyses', 'product_usps', 'customers', 'import_jobs'
  ])
  loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);

    execute format('create policy "owner_select" on public.%I for select using (owner_id = auth.uid())', t);
    execute format('create policy "owner_insert" on public.%I for insert with check (owner_id = auth.uid())', t);
    execute format('create policy "owner_update" on public.%I for update using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t);
    execute format('create policy "owner_delete" on public.%I for delete using (owner_id = auth.uid())', t);
  end loop;
end $$;
