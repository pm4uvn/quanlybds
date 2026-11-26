import * as XLSX from "xlsx";
import type { ImportRowError, Project, Property, PropertyType, TransactionType } from "./types";
import { v4 as uuid } from "uuid";

// Column headers (Vietnamese) used for both the downloadable import template
// and the export. Keep this list in sync with `ROW_MAPPERS` below.
export const EXCEL_COLUMNS = [
  "Tên sản phẩm",
  "Dự án",
  "Loại hình",
  "Giao dịch",
  "Block",
  "Tầng",
  "Số căn/lô",
  "Diện tích đất (m2)",
  "Diện tích sử dụng (m2)",
  "Số phòng ngủ",
  "Số phòng tắm",
  "Hướng",
  "Giá niêm yết (VND)",
  "Giảm giá (VND)",
  "Giá bán cuối (VND)",
  "Trạng thái",
  "Pháp lý",
  "Ghi chú",
] as const;

const PROPERTY_TYPE_BY_LABEL: Record<string, PropertyType> = {
  "căn hộ": "can_ho",
  "nhà phố": "nha_pho",
  "biệt thự": "biet_thu",
  "đất nền": "dat_nen",
  shophouse: "shophouse",
  "nhà ở riêng lẻ": "nha_rieng_le",
  "cho thuê": "cho_thue",
};

const TRANSACTION_BY_LABEL: Record<string, TransactionType> = {
  "bán": "sale",
  "cho thuê": "rent",
};

export interface ParsedImportResult {
  rows: Property[];
  errors: ImportRowError[];
  duplicates: number;
  totalRows: number;
}

export async function parsePropertyWorkbook(
  file: File,
  projects: Project[],
  existing: Property[]
): Promise<ParsedImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const errors: ImportRowError[] = [];
  const rows: Property[] = [];
  let duplicates = 0;
  const now = new Date().toISOString();
  const existingKeys = new Set(
    existing.map((p) => `${p.name.trim().toLowerCase()}|${p.block ?? ""}|${p.unitNumber ?? ""}`)
  );

  raw.forEach((record, idx) => {
    const rowNum = idx + 2; // header is row 1
    const name = String(record["Tên sản phẩm"] ?? "").trim();
    if (!name) {
      errors.push({ row: rowNum, field: "Tên sản phẩm", message: "Thiếu tên sản phẩm" });
      return;
    }

    const projectName = String(record["Dự án"] ?? "").trim();
    const project = projectName
      ? projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase())
      : undefined;
    if (projectName && !project) {
      errors.push({ row: rowNum, field: "Dự án", message: `Không tìm thấy dự án "${projectName}"` });
    }

    const typeLabel = String(record["Loại hình"] ?? "").trim().toLowerCase();
    const propertyType = PROPERTY_TYPE_BY_LABEL[typeLabel];
    if (!propertyType) {
      errors.push({ row: rowNum, field: "Loại hình", message: `Loại hình không hợp lệ: "${record["Loại hình"]}"` });
      return;
    }

    const txLabel = String(record["Giao dịch"] ?? "bán").trim().toLowerCase();
    const transactionType = TRANSACTION_BY_LABEL[txLabel] ?? "sale";

    const listingPrice = toNumber(record["Giá niêm yết (VND)"]);
    const discount = toNumber(record["Giảm giá (VND)"]);
    const finalPrice =
      toNumber(record["Giá bán cuối (VND)"]) ??
      (listingPrice !== undefined ? listingPrice - (discount ?? 0) : undefined);

    const block = String(record["Block"] ?? "").trim() || undefined;
    const unitNumber = String(record["Số căn/lô"] ?? "").trim() || undefined;
    const dupKey = `${name.toLowerCase()}|${block ?? ""}|${unitNumber ?? ""}`;
    if (existingKeys.has(dupKey)) {
      duplicates += 1;
    }
    existingKeys.add(dupKey);

    const property: Property = {
      id: uuid(),
      projectId: project?.id,
      name,
      propertyType,
      transactionType,
      block,
      floor: String(record["Tầng"] ?? "").trim() || undefined,
      unitNumber,
      landArea: toNumber(record["Diện tích đất (m2)"]),
      usableArea: toNumber(record["Diện tích sử dụng (m2)"]),
      bedrooms: toNumber(record["Số phòng ngủ"]),
      bathrooms: toNumber(record["Số phòng tắm"]),
      direction: undefined,
      listingPrice,
      discount,
      finalPrice,
      status: parseStatus(String(record["Trạng thái"] ?? "")),
      legalStatus: parseLegal(String(record["Pháp lý"] ?? "")),
      legalSource: { status: "missing" },
      availabilitySource: { status: "unverified" },
      notes: String(record["Ghi chú"] ?? "").trim() || undefined,
      images: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
    };

    rows.push(property);
  });

  return { rows, errors, duplicates, totalRows: raw.length };
}

function toNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isNaN(n) ? undefined : n;
}

function parseStatus(label: string): Property["status"] {
  const l = label.trim().toLowerCase();
  if (l.includes("giữ chỗ")) return "on_hold";
  if (l.includes("đặt cọc") || l.includes("reserved")) return "reserved";
  if (l.includes("bán")) return "sold";
  if (l.includes("ngừng")) return "unavailable";
  if (l.includes("chờ")) return "pending_verification";
  return "available";
}

function parseLegal(label: string): Property["legalStatus"] {
  const l = label.trim().toLowerCase();
  if (l.includes("đã xác minh") || l.includes("verified")) return "verified";
  if (l.includes("vấn đề") || l.includes("issue")) return "issue";
  if (l.includes("chờ")) return "pending";
  return "unverified";
}

export function downloadImportTemplate() {
  const sample = [
    {
      "Tên sản phẩm": "Căn A-12-05",
      "Dự án": "",
      "Loại hình": "Căn hộ",
      "Giao dịch": "Bán",
      Block: "A",
      Tầng: "12",
      "Số căn/lô": "05",
      "Diện tích đất (m2)": "",
      "Diện tích sử dụng (m2)": 68,
      "Số phòng ngủ": 2,
      "Số phòng tắm": 2,
      Hướng: "Đông Nam",
      "Giá niêm yết (VND)": 2800000000,
      "Giảm giá (VND)": 50000000,
      "Giá bán cuối (VND)": 2750000000,
      "Trạng thái": "Còn hàng",
      "Pháp lý": "Chưa xác minh",
      "Ghi chú": "",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: EXCEL_COLUMNS as unknown as string[] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");
  XLSX.writeFile(wb, "Realty360_mau_nhap_san_pham.xlsx");
}

export function exportProperties(properties: Property[], projects: Project[]) {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const data = properties.map((p) => ({
    "Tên sản phẩm": p.name,
    "Dự án": p.projectId ? projectById.get(p.projectId)?.name ?? "" : "",
    "Loại hình": labelForType(p.propertyType),
    "Giao dịch": p.transactionType === "rent" ? "Cho thuê" : "Bán",
    Block: p.block ?? "",
    Tầng: p.floor ?? "",
    "Số căn/lô": p.unitNumber ?? "",
    "Diện tích đất (m2)": p.landArea ?? "",
    "Diện tích sử dụng (m2)": p.usableArea ?? "",
    "Số phòng ngủ": p.bedrooms ?? "",
    "Số phòng tắm": p.bathrooms ?? "",
    Hướng: p.direction ?? "",
    "Giá niêm yết (VND)": p.listingPrice ?? "",
    "Giảm giá (VND)": p.discount ?? "",
    "Giá bán cuối (VND)": p.finalPrice ?? "",
    "Trạng thái": statusLabel(p.status),
    "Pháp lý": legalLabel(p.legalStatus),
    "Ghi chú": p.notes ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(data, { header: EXCEL_COLUMNS as unknown as string[] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");
  XLSX.writeFile(wb, `Realty360_xuat_san_pham_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function labelForType(t: PropertyType): string {
  return Object.entries(PROPERTY_TYPE_BY_LABEL).find(([, v]) => v === t)?.[0] ?? t;
}
function statusLabel(s: Property["status"]): string {
  return (
    {
      available: "Còn hàng",
      on_hold: "Đang giữ chỗ",
      reserved: "Đã đặt cọc",
      sold: "Đã bán",
      unavailable: "Ngừng bán",
      pending_verification: "Chờ xác minh",
    } as const
  )[s];
}
function legalLabel(s: Property["legalStatus"]): string {
  return (
    {
      verified: "Đã xác minh",
      pending: "Chờ xác minh",
      unverified: "Chưa xác minh",
      issue: "Có vấn đề",
    } as const
  )[s];
}
