"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  customersCol,
  getScoringWeights,
  importJobsCol,
  projectsCol,
  propertiesCol,
  scoresCol,
  swotCol,
  uspCol,
} from "./repo";
import type { ScoringWeights } from "./types";

const EMPTY_ARRAY: unknown[] = [];

function useCollectionData<T>(col: {
  getAll: () => T[];
  subscribe: (listener: () => void) => () => void;
}): T[] {
  return useSyncExternalStore(
    col.subscribe,
    col.getAll,
    () => EMPTY_ARRAY as T[]
  );
}

export function useProjects() {
  return useCollectionData(projectsCol);
}

export function useProperties() {
  return useCollectionData(propertiesCol);
}

export function useCustomers() {
  return useCollectionData(customersCol);
}

export function useImportJobs() {
  return useCollectionData(importJobsCol);
}

export function useProject(id: string | undefined) {
  const projects = useProjects();
  return id ? projects.find((p) => p.id === id) : undefined;
}

export function useProperty(id: string | undefined) {
  const properties = useProperties();
  return id ? properties.find((p) => p.id === id) : undefined;
}

export function useProductScore(propertyId: string | undefined) {
  const scores = useCollectionData(scoresCol);
  return propertyId ? scores.find((s) => s.id === propertyId) : undefined;
}

export function useSwotAnalysis(propertyId: string | undefined) {
  const items = useCollectionData(swotCol);
  return propertyId ? items.find((s) => s.id === propertyId) : undefined;
}

export function useProductUsp(propertyId: string | undefined) {
  const items = useCollectionData(uspCol);
  return propertyId ? items.find((s) => s.id === propertyId) : undefined;
}

export function useScoringWeights(): ScoringWeights {
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener("realty360:weights-changed", listener);
    return () => window.removeEventListener("realty360:weights-changed", listener);
  }, []);
  return useSyncExternalStore(subscribe, getScoringWeights, getScoringWeights);
}
