import type { Customer, Project, Property } from "./types";
import { PROPERTY_TYPE_LABEL } from "./types";

export interface Kpis {
  totalProjects: number;
  totalProperties: number;
  available: number;
  onHold: number;
  sold: number;
  priority: number;
  totalInventoryValue: number;
  avgPrice: number;
  avgPricePerM2: number;
  activeCustomers: number;
  followUpsToday: number;
  expectedCommission: number;
}

export function computeKpis(properties: Property[], customers: Customer[]): Kpis {
  const active = properties.filter((p) => !p.archivedAt);
  const available = active.filter((p) => p.status === "available");
  const onHold = active.filter((p) => p.status === "on_hold" || p.status === "reserved");
  const sold = active.filter((p) => p.status === "sold");
  const priority = active.filter((p) => p.tags.includes("ưu tiên tư vấn"));

  const sellable = active.filter((p) => p.status === "available" || p.status === "on_hold");
  const totalInventoryValue = sellable.reduce((sum, p) => sum + (p.finalPrice ?? p.listingPrice ?? 0), 0);
  const withPrice = sellable.filter((p) => (p.finalPrice ?? p.listingPrice) !== undefined);
  const avgPrice = withPrice.length
    ? withPrice.reduce((s, p) => s + (p.finalPrice ?? p.listingPrice ?? 0), 0) / withPrice.length
    : 0;

  const withPricePerM2 = sellable.filter((p) => (p.finalPrice ?? p.listingPrice) && p.usableArea);
  const avgPricePerM2 = withPricePerM2.length
    ? withPricePerM2.reduce((s, p) => s + (p.finalPrice ?? p.listingPrice ?? 0) / (p.usableArea ?? 1), 0) /
      withPricePerM2.length
    : 0;

  const activeCustomers = customers.filter((c) => c.stage !== "closed_won" && c.stage !== "closed_lost").length;

  const todayStr = new Date().toDateString();
  const followUpsToday = customers.filter(
    (c) => c.nextFollowUpDate && new Date(c.nextFollowUpDate).toDateString() === todayStr
  ).length;

  const expectedCommission = sold.reduce(
    (sum, p) => sum + ((p.finalPrice ?? p.listingPrice ?? 0) * (p.commissionRate ?? 2)) / 100,
    0
  );

  return {
    totalProjects: 0, // filled by caller with project count
    totalProperties: active.length,
    available: available.length,
    onHold: onHold.length,
    sold: sold.length,
    priority: priority.length,
    totalInventoryValue,
    avgPrice,
    avgPricePerM2,
    activeCustomers,
    followUpsToday,
    expectedCommission,
  };
}

const PRICE_BUCKETS = [
  { label: "< 2 tỷ", min: 0, max: 2_000_000_000 },
  { label: "2 - 3 tỷ", min: 2_000_000_000, max: 3_000_000_000 },
  { label: "3 - 5 tỷ", min: 3_000_000_000, max: 5_000_000_000 },
  { label: "5 - 10 tỷ", min: 5_000_000_000, max: 10_000_000_000 },
  { label: "> 10 tỷ", min: 10_000_000_000, max: Infinity },
];

export function priceDistribution(properties: Property[]) {
  return PRICE_BUCKETS.map((b) => ({
    label: b.label,
    count: properties.filter((p) => {
      const price = p.finalPrice ?? p.listingPrice;
      return price !== undefined && price >= b.min && price < b.max;
    }).length,
  }));
}

export function typeDistribution(properties: Property[]) {
  const map = new Map<string, number>();
  for (const p of properties) {
    const label = PROPERTY_TYPE_LABEL[p.propertyType];
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

export function projectDistribution(properties: Property[], projects: Project[]) {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const map = new Map<string, number>();
  for (const p of properties) {
    const label = p.projectId ? projectById.get(p.projectId)?.name ?? "Khác" : "Không thuộc dự án";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

export function availabilityDistribution(properties: Property[]) {
  const labels: Record<string, string> = {
    available: "Còn hàng",
    on_hold: "Đang giữ chỗ",
    reserved: "Đã đặt cọc",
    sold: "Đã bán",
    unavailable: "Ngừng bán",
    pending_verification: "Chờ xác minh",
  };
  const map = new Map<string, number>();
  for (const p of properties) {
    const label = labels[p.status];
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

export function customerBudgetDistribution(customers: Customer[]) {
  return PRICE_BUCKETS.map((b) => ({
    label: b.label,
    count: customers.filter((c) => {
      const budget = c.budgetMax ?? c.budgetMin;
      return budget !== undefined && budget >= b.min && budget < b.max;
    }).length,
  }));
}

export function pipelineDistribution(customers: Customer[]) {
  const labels: Record<string, string> = {
    new_lead: "Khách mới",
    qualified: "Đã sàng lọc",
    consulting: "Đang tư vấn",
    viewing: "Xem nhà",
    negotiation: "Đàm phán",
    reservation: "Đặt cọc",
    closed_won: "Thành công",
    closed_lost: "Không thành công",
  };
  const order = Object.keys(labels);
  const map = new Map<string, number>();
  for (const c of customers) map.set(c.stage, (map.get(c.stage) ?? 0) + 1);
  return order.map((stage) => ({ label: labels[stage], count: map.get(stage) ?? 0 }));
}
