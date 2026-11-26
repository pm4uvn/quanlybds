import type { Property } from "./types";

const FIELDS: { key: keyof Property; label: string }[] = [
  { key: "usableArea", label: "Diện tích sử dụng" },
  { key: "bedrooms", label: "Số phòng ngủ" },
  { key: "bathrooms", label: "Số phòng tắm" },
  { key: "direction", label: "Hướng" },
  { key: "furnishing", label: "Nội thất" },
  { key: "listingPrice", label: "Giá niêm yết" },
  { key: "description", label: "Mô tả sản phẩm" },
  { key: "advantages", label: "Ưu điểm" },
  { key: "disadvantages", label: "Nhược điểm" },
  { key: "images", label: "Hình ảnh" },
];

export interface CompletenessResult {
  percent: number;
  missing: string[];
}

export function propertyCompleteness(property: Property): CompletenessResult {
  const missing: string[] = [];
  let filled = 0;
  for (const f of FIELDS) {
    const v = property[f.key];
    const isEmpty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (isEmpty) missing.push(f.label);
    else filled += 1;
  }
  return { percent: Math.round((filled / FIELDS.length) * 100), missing };
}
