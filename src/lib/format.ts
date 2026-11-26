// Vietnamese formatting conventions for money (VND / triệu / tỷ) and area (m²).

export function formatVnd(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  if (value >= 1_000_000_000) {
    const ty = value / 1_000_000_000;
    return `${trimNumber(ty)} tỷ`;
  }
  if (value >= 1_000_000) {
    const trieu = value / 1_000_000;
    return `${trimNumber(trieu)} triệu`;
  }
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatVndFull(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatArea(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("vi-VN")} m²`;
}

export function formatPercent(value: number | undefined | null, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
}

function trimNumber(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
