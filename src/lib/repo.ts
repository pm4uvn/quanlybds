import { SupabaseCollection } from "./supabase/collection";
import {
  customerMapper,
  importJobMapper,
  productScoreMapper,
  projectMapper,
  propertyMapper,
  swotMapper,
  uspMapper,
} from "./supabase/mappers";
import type {
  Customer,
  ImportJob,
  Project,
  Property,
  ProductScore,
  ProductUsp,
  ScoringWeights,
  SwotAnalysis,
} from "./types";
import { DEFAULT_SCORING_WEIGHTS } from "./types";

// Every collection below reads/writes the agent's real Supabase database,
// scoped by Row Level Security to the signed-in user (see supabase/schema.sql).
// See src/lib/supabase/collection.ts for how the cache + realtime sync works.

export const projectsCol = new SupabaseCollection<Project>(projectMapper);
export const propertiesCol = new SupabaseCollection<Property>(propertyMapper);
export const customersCol = new SupabaseCollection<Customer>(customerMapper);
export const scoresCol = new SupabaseCollection<ProductScore & { id: string }>(productScoreMapper);
export const swotCol = new SupabaseCollection<SwotAnalysis & { id: string }>(swotMapper);
export const uspCol = new SupabaseCollection<ProductUsp & { id: string }>(uspMapper);
export const importJobsCol = new SupabaseCollection<ImportJob>(importJobMapper);

// Scoring weights are a personal preference, not business data — kept in
// localStorage rather than adding a settings table.
const WEIGHTS_KEY = "realty360:scoring_weights";

export function getScoringWeights(): ScoringWeights {
  if (typeof window === "undefined") return DEFAULT_SCORING_WEIGHTS;
  try {
    const raw = window.localStorage.getItem(WEIGHTS_KEY);
    return raw ? { ...DEFAULT_SCORING_WEIGHTS, ...JSON.parse(raw) } : DEFAULT_SCORING_WEIGHTS;
  } catch {
    return DEFAULT_SCORING_WEIGHTS;
  }
}

export function setScoringWeights(weights: ScoringWeights) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  window.dispatchEvent(new CustomEvent("realty360:weights-changed"));
}

export function getScore(propertyId: string): (ProductScore & { id: string }) | undefined {
  return scoresCol.getById(propertyId);
}

export function getSwot(propertyId: string): (SwotAnalysis & { id: string }) | undefined {
  return swotCol.getById(propertyId);
}

export function getUsp(propertyId: string): (ProductUsp & { id: string }) | undefined {
  return uspCol.getById(propertyId);
}
