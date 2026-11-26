import type { ProductScoreInputs, ScoringWeights } from "./types";

export const SCORE_CRITERIA: { key: keyof ProductScoreInputs; label: string }[] = [
  { key: "location", label: "Vị trí" },
  { key: "price", label: "Giá cạnh tranh" },
  { key: "legal", label: "Pháp lý & hồ sơ" },
  { key: "amenities", label: "Tiện ích" },
  { key: "livability", label: "Phù hợp để ở" },
  { key: "investment", label: "Tiềm năng đầu tư" },
  { key: "liquidity", label: "Thanh khoản" },
];

export interface ScoreResult {
  overall: number | null;
  coverage: number; // 0-100, % of weight backed by actual data
  breakdown: { key: keyof ProductScoreInputs; label: string; value: number | null; weight: number }[];
}

export function computeScore(
  inputs: ProductScoreInputs,
  weights: ScoringWeights
): ScoreResult {
  let weightedSum = 0;
  let coveredWeight = 0;
  let totalWeight = 0;

  const breakdown = SCORE_CRITERIA.map(({ key, label }) => {
    const weight = weights[key];
    totalWeight += weight;
    const value = inputs[key]?.value ?? null;
    if (value !== null) {
      weightedSum += value * weight;
      coveredWeight += weight;
    }
    return { key, label, value, weight };
  });

  const coverage = totalWeight > 0 ? (coveredWeight / totalWeight) * 100 : 0;
  const overall = coveredWeight > 0 ? weightedSum / coveredWeight : null;

  return { overall, coverage, breakdown };
}

export function emptyScoreInputs(): ProductScoreInputs {
  return {
    location: { value: null },
    price: { value: null },
    legal: { value: null },
    amenities: { value: null },
    livability: { value: null },
    investment: { value: null },
    liquidity: { value: null },
  };
}

export function dataConfidenceLabel(coverage: number): string {
  if (coverage >= 90) return "Độ tin cậy cao";
  if (coverage >= 60) return "Độ tin cậy trung bình";
  if (coverage > 0) return "Độ tin cậy thấp";
  return "Chưa có dữ liệu";
}
