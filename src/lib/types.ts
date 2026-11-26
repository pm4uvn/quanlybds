// Core domain types for Realty360 Phase 1 (Product Intelligence MVP).
// Data is persisted locally (demo mode) behind the repository in `lib/repo.ts`,
// which can be swapped for a Supabase-backed implementation later without
// changing call sites.

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "outdated"
  | "missing"
  | "conflicting";

export type LegalStatus =
  | "verified"
  | "pending"
  | "unverified"
  | "issue";

export interface SourceInfo {
  source?: string;
  lastVerifiedAt?: string;
  verifiedBy?: string;
  status: VerificationStatus;
}

export type ProjectType =
  | "can_ho"
  | "nha_pho"
  | "biet_thu"
  | "dat_nen"
  | "shophouse"
  | "khu_do_thi"
  | "khac";

export type ConstructionStatus =
  | "planning"
  | "under_construction"
  | "completed"
  | "handed_over";

export interface ProjectDocument {
  id: string;
  name: string;
  category: "brochure" | "legal" | "payment_policy" | "other";
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  developer: string;
  projectType: ProjectType;
  address: string;
  province: string;
  district: string;
  lat?: number;
  lng?: number;
  description?: string;
  constructionStatus: ConstructionStatus;
  expectedHandover?: string;
  totalArea?: number;
  totalUnits?: number;
  constructionDensity?: number;
  images: string[];

  // Location
  distanceToCenterKm?: number;
  nearbySchools?: string;
  nearbyHospitals?: string;
  nearbyShopping?: string;
  publicTransport?: string;
  mainRoads?: string;
  employmentCenters?: string;
  existingInfrastructure?: string;
  plannedInfrastructure?: string;
  locationAdvantages?: string;
  locationDisadvantages?: string;

  // Legal
  landUseDocs?: string;
  constructionPermit?: string;
  ownershipType?: string;
  ownershipDuration?: string;
  salesEligibilityDocs?: string;
  legalVerification: SourceInfo;

  // Commercial
  startingPrice?: number;
  avgPricePerM2?: number;
  paymentPolicy?: string;
  bankFinancingPolicy?: string;
  promotionPolicy?: string;
  commissionPolicy?: string;
  managementFee?: number;
  maintenanceFee?: number;

  documents: ProjectDocument[];

  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type PropertyType =
  | "can_ho"
  | "nha_pho"
  | "biet_thu"
  | "dat_nen"
  | "shophouse"
  | "nha_rieng_le"
  | "cho_thue";

export type TransactionType = "sale" | "rent";

export type Direction =
  | "dong"
  | "tay"
  | "nam"
  | "bac"
  | "dong_bac"
  | "dong_nam"
  | "tay_bac"
  | "tay_nam";

export type FurnishingStatus = "tho" | "co_ban" | "day_du" | "cao_cap";

export type PropertyStatus =
  | "available"
  | "on_hold"
  | "reserved"
  | "sold"
  | "unavailable"
  | "pending_verification";

export interface Property {
  id: string;
  projectId?: string;
  name: string;
  propertyType: PropertyType;
  transactionType: TransactionType;

  block?: string;
  floor?: string;
  unitNumber?: string;

  landArea?: number;
  usableArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  direction?: Direction;
  balconyDirection?: Direction;
  view?: string;
  furnishing?: FurnishingStatus;

  listingPrice?: number;
  discount?: number;
  finalPrice?: number;
  priceAreaBasis?: "land" | "usable";
  estimatedFees?: number;
  rentalPrice?: number;
  paymentPolicy?: string;
  commissionRate?: number;

  ownerSource?: string;
  description?: string;
  advantages?: string;
  disadvantages?: string;
  images: string[];
  floorPlan?: string;

  legalStatus: LegalStatus;
  legalSource: SourceInfo;
  availabilitySource: SourceInfo;

  status: PropertyStatus;
  tags: string[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  archivedAt?: string | null;
  isDemo?: boolean;
  isFavorite?: boolean;
}

export interface ScoringWeights {
  location: number;
  price: number;
  legal: number;
  amenities: number;
  livability: number;
  investment: number;
  liquidity: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  location: 20,
  price: 20,
  legal: 20,
  amenities: 10,
  livability: 10,
  investment: 10,
  liquidity: 10,
};

export interface ScoreCriterionInput {
  value: number | null; // 0-100, null = no data
  note?: string;
}

export interface ProductScoreInputs {
  location: ScoreCriterionInput;
  price: ScoreCriterionInput;
  legal: ScoreCriterionInput;
  amenities: ScoreCriterionInput;
  livability: ScoreCriterionInput;
  investment: ScoreCriterionInput;
  liquidity: ScoreCriterionInput;
}

export interface ProductScore {
  propertyId: string;
  weights: ScoringWeights;
  inputs: ProductScoreInputs;
  evaluatedAt: string;
}

export interface SwotAnalysis {
  propertyId: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  updatedAt: string;
  approved: boolean;
}

export interface ProductUsp {
  propertyId: string;
  topReasons: string[];
  competitiveAdvantages: string[];
  differentiation: string;
  idealCustomers: string[];
  notSuitableFor: string[];
  objections: { objection: string; response: string }[];
  elevatorPitch: string;
  updatedAt: string;
}

export type CustomerPurpose =
  | "mua_de_o"
  | "mua_cho_gia_dinh"
  | "dau_tu_tang_gia"
  | "dau_tu_cho_thue"
  | "giu_tai_san"
  | "kinh_doanh";

export type PipelineStage =
  | "new_lead"
  | "qualified"
  | "consulting"
  | "viewing"
  | "negotiation"
  | "reservation"
  | "closed_won"
  | "closed_lost";

export interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  budgetMin?: number;
  budgetMax?: number;
  purpose: CustomerPurpose;
  preferredLocation?: string;
  preferredPropertyType?: PropertyType;
  minArea?: number;
  minBedrooms?: number;
  essentialRequirements?: string;
  timeline?: string;
  notes?: string;
  stage: PipelineStage;
  nextFollowUpDate?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  errors: ImportRowError[];
  createdAt: string;
}

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  can_ho: "Căn hộ",
  nha_pho: "Nhà phố",
  biet_thu: "Biệt thự",
  dat_nen: "Đất nền",
  shophouse: "Shophouse",
  khu_do_thi: "Khu đô thị",
  khac: "Khác",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  can_ho: "Căn hộ",
  nha_pho: "Nhà phố",
  biet_thu: "Biệt thự",
  dat_nen: "Đất nền",
  shophouse: "Shophouse",
  nha_rieng_le: "Nhà ở riêng lẻ",
  cho_thue: "Cho thuê",
};

export const PROPERTY_STATUS_LABEL: Record<PropertyStatus, string> = {
  available: "Còn hàng",
  on_hold: "Đang giữ chỗ",
  reserved: "Đã đặt cọc",
  sold: "Đã bán",
  unavailable: "Ngừng bán",
  pending_verification: "Chờ xác minh",
};

export const DIRECTION_LABEL: Record<Direction, string> = {
  dong: "Đông",
  tay: "Tây",
  nam: "Nam",
  bac: "Bắc",
  dong_bac: "Đông Bắc",
  dong_nam: "Đông Nam",
  tay_bac: "Tây Bắc",
  tay_nam: "Tây Nam",
};

export const FURNISHING_LABEL: Record<FurnishingStatus, string> = {
  tho: "Nhà thô",
  co_ban: "Nội thất cơ bản",
  day_du: "Nội thất đầy đủ",
  cao_cap: "Nội thất cao cấp",
};

export const CONSTRUCTION_STATUS_LABEL: Record<ConstructionStatus, string> = {
  planning: "Đang lên kế hoạch",
  under_construction: "Đang xây dựng",
  completed: "Đã hoàn thiện",
  handed_over: "Đã bàn giao",
};

export const CUSTOMER_PURPOSE_LABEL: Record<CustomerPurpose, string> = {
  mua_de_o: "Mua để ở",
  mua_cho_gia_dinh: "Mua cho gia đình",
  dau_tu_tang_gia: "Đầu tư tăng giá",
  dau_tu_cho_thue: "Đầu tư cho thuê",
  giu_tai_san: "Giữ tài sản",
  kinh_doanh: "Kinh doanh",
};

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> = {
  new_lead: "Khách mới",
  qualified: "Đã sàng lọc",
  consulting: "Đang tư vấn",
  viewing: "Xem nhà",
  negotiation: "Đàm phán",
  reservation: "Đặt cọc",
  closed_won: "Thành công",
  closed_lost: "Không thành công",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Đã xác minh",
  unverified: "Chưa xác minh",
  outdated: "Đã lỗi thời",
  missing: "Thiếu dữ liệu",
  conflicting: "Dữ liệu mâu thuẫn",
};
