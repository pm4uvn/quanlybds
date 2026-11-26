import { collection, STORAGE_PREFIX } from "./storage";
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

export const COLLECTION_NAMES = [
  "projects",
  "properties",
  "customers",
  "scores",
  "swot",
  "usp",
  "import_jobs",
] as const;

export const projectsCol = collection<Project>("projects");
export const propertiesCol = collection<Property>("properties");
export const customersCol = collection<Customer>("customers");
export const scoresCol = collection<ProductScore & { id: string }>("scores");
export const swotCol = collection<SwotAnalysis & { id: string }>("swot");
export const uspCol = collection<ProductUsp & { id: string }>("usp");
export const importJobsCol = collection<ImportJob>("import_jobs");

const WEIGHTS_KEY = `${STORAGE_PREFIX}scoring_weights`;

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

export function isDemoDataActive(): boolean {
  return (
    projectsCol.getAll().some((p) => p.isDemo) ||
    propertiesCol.getAll().some((p) => p.isDemo)
  );
}
