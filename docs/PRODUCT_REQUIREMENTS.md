# Realty360 — Product Requirements (Phase 1 MVP)

## Problem

A Vietnamese real estate agent with ~3 months of experience struggles to:
manage product data scattered across Excel/PDF/images/chat, remember product
specs, systematically understand strengths/weaknesses, compare competing
projects, match products to customers, handle objections, and model
financing — all with limited sales experience.

## Vision

Product Data → Product Understanding → Competitive Analysis → Customer
Matching → Sales Strategy → Follow-up → Conversion.

Slogan: *Hiểu sản phẩm – Hiểu khách hàng – Bán hàng hiệu quả.*

## Phase 1 scope (this build)

In scope: project management, product inventory (CRUD, Excel import/export,
quick-add, completeness tracking), product intelligence (configurable
weighted scoring, SWOT, USP/sales scripts), product comparison with a
customer-facing export, data-quality/verification tracking, and a dashboard
with rule-based insights.

Out of scope (Phase 2+, visible in nav as "Sắp có" with an honest roadmap
page, never a dead link): customer CRM & pipeline, smart matching, AI sales
assistant, financial calculators, learning academy, multi-agent SaaS.

## Acceptance criteria (Phase 1)

A user can: create a project; add a property manually in under two minutes;
bulk-import properties from Excel with validation/duplicate reporting;
search/filter the inventory; view a complete property detail page; see what
information is missing or unverified; configure and compute a weighted
product score that never silently treats missing data as zero; create and
approve a SWOT analysis; compare 3+ properties; export a customer-facing
comparison that excludes commission/internal notes; see dashboard metrics
computed only from stored data; do all of the above on desktop and mobile;
and reload the app without losing data (local persistence).

## Non-negotiable trust rules

Missing data is never scored as zero or shown as verified. Unverified legal
status is never presented as safe. AI-generated content (Phase 3) must be
clearly labeled and traceable to its source data — not implemented yet, so
this rule currently applies to manually-entered scoring/SWOT/USP content
instead, which carries explicit "chưa phê duyệt" / "chưa đủ dữ liệu" states.
