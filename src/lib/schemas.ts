import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên dự án"),
  developer: z.string().min(1, "Vui lòng nhập chủ đầu tư"),
  projectType: z.enum(["can_ho", "nha_pho", "biet_thu", "dat_nen", "shophouse", "khu_do_thi", "khac"]),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  description: z.string().optional(),
  constructionStatus: z.enum(["planning", "under_construction", "completed", "handed_over"]),
  expectedHandover: z.string().optional(),
  totalUnits: z.coerce.number().optional(),
  startingPrice: z.coerce.number().optional(),
  avgPricePerM2: z.coerce.number().optional(),
  paymentPolicy: z.string().optional(),
  bankFinancingPolicy: z.string().optional(),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;

export const propertyQuickSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  projectId: z.string().optional(),
  propertyType: z.enum(["can_ho", "nha_pho", "biet_thu", "dat_nen", "shophouse", "nha_rieng_le", "cho_thue"]),
  transactionType: z.enum(["sale", "rent"]),
  usableArea: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  listingPrice: z.coerce.number().optional(),
  status: z.enum(["available", "on_hold", "reserved", "sold", "unavailable", "pending_verification"]),
});
export type PropertyQuickFormValues = z.infer<typeof propertyQuickSchema>;

export const propertyFullSchema = propertyQuickSchema.extend({
  block: z.string().optional(),
  floor: z.string().optional(),
  unitNumber: z.string().optional(),
  landArea: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  direction: z
    .enum(["dong", "tay", "nam", "bac", "dong_bac", "dong_nam", "tay_bac", "tay_nam"])
    .optional(),
  furnishing: z.enum(["tho", "co_ban", "day_du", "cao_cap"]).optional(),
  discount: z.coerce.number().optional(),
  commissionRate: z.coerce.number().optional(),
  legalStatus: z.enum(["verified", "pending", "unverified", "issue"]),
  description: z.string().optional(),
  advantages: z.string().optional(),
  disadvantages: z.string().optional(),
  notes: z.string().optional(),
});
export type PropertyFullFormValues = z.infer<typeof propertyFullSchema>;
