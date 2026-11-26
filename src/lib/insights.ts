import type { Customer, Property } from "./types";

export interface Insight {
  id: string;
  text: string;
  tone: "info" | "warning" | "success";
}

// All insights are derived directly from stored data (never fabricated).
export function generateInsights(properties: Property[], customers: Customer[]): Insight[] {
  const insights: Insight[] = [];
  const active = properties.filter((p) => !p.archivedAt && p.status === "available");

  const BUDGET_BUCKETS = [
    { label: "2 – 3 tỷ", min: 2_000_000_000, max: 3_000_000_000 },
    { label: "3 – 5 tỷ", min: 3_000_000_000, max: 5_000_000_000 },
  ];
  for (const bucket of BUDGET_BUCKETS) {
    const matchCustomers = customers.filter((c) => {
      const b = c.budgetMax ?? c.budgetMin;
      return b !== undefined && b >= bucket.min && b < bucket.max;
    });
    const matchProperties = active.filter((p) => {
      const price = p.finalPrice ?? p.listingPrice;
      return price !== undefined && price >= bucket.min && price < bucket.max;
    });
    if (matchCustomers.length > 0 && matchProperties.length > 0) {
      insights.push({
        id: `budget-${bucket.label}`,
        tone: "success",
        text: `Có ${matchProperties.length} sản phẩm phù hợp với ${matchCustomers.length} khách hàng ngân sách ${bucket.label}.`,
      });
    }
  }

  const missingLegal = active.filter((p) => p.legalStatus === "unverified" || p.legalStatus === "issue");
  if (missingLegal.length > 0) {
    insights.push({
      id: "missing-legal",
      tone: "warning",
      text: `Có ${missingLegal.length} sản phẩm đang thiếu hoặc chưa xác minh thông tin pháp lý.`,
    });
  }

  const todayStr = new Date().toDateString();
  const dueToday = customers.filter((c) => c.nextFollowUpDate && new Date(c.nextFollowUpDate).toDateString() === todayStr);
  if (dueToday.length > 0) {
    insights.push({
      id: "followup-today",
      tone: "info",
      text: `Có ${dueToday.length} khách hàng cần chăm sóc lại hôm nay.`,
    });
  }

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const outdatedPrice = active.filter((p) => {
    const verified = p.availabilitySource.lastVerifiedAt;
    return !verified || new Date(verified).getTime() < ninetyDaysAgo;
  });
  if (outdatedPrice.length > 0) {
    insights.push({
      id: "outdated-price",
      tone: "warning",
      text: `Có ${outdatedPrice.length} sản phẩm cần xác minh lại giá bán (quá 90 ngày chưa cập nhật).`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "empty",
      tone: "info",
      text: "Chưa có đủ dữ liệu để tạo nhận định. Hãy thêm sản phẩm và khách hàng để Realty360 phân tích.",
    });
  }

  return insights;
}
