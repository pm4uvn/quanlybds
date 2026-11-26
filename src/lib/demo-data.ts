import { v4 as uuid } from "uuid";
import {
  projectsCol,
  propertiesCol,
  customersCol,
  scoresCol,
  swotCol,
  uspCol,
} from "./repo";
import type {
  Customer,
  Direction,
  Project,
  Property,
  ProductScore,
  SwotAnalysis,
  ProductUsp,
} from "./types";
import { emptyScoreInputs } from "./scoring";

// Deterministic fictional demo dataset: 5 projects, 30 properties, 15 customers.
// Everything created here is tagged `isDemo: true` so it can be cleared later
// with `clearDemoData()` without touching real agent data.

const DIRECTIONS: Direction[] = ["dong", "tay", "nam", "bac", "dong_bac", "dong_nam", "tay_bac", "tay_nam"];

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

const PROJECT_SEEDS: Array<Omit<Project, "id" | "createdAt" | "updatedAt" | "images" | "documents" | "legalVerification" | "isDemo">> = [
  {
    name: "Sunrise Riverside",
    developer: "Nam Long Group",
    projectType: "can_ho",
    address: "Đường Nguyễn Hữu Thọ, Quận 7",
    province: "TP. Hồ Chí Minh",
    district: "Quận 7",
    description: "Khu căn hộ ven sông với hệ thống tiện ích nội khu khép kín.",
    constructionStatus: "handed_over",
    expectedHandover: "2022-06-01",
    totalArea: 24,
    totalUnits: 1200,
    constructionDensity: 35,
    distanceToCenterKm: 10,
    nearbySchools: "Trường Quốc tế Nam Sài Gòn (1.2km)",
    nearbyHospitals: "Bệnh viện FV (3km)",
    nearbyShopping: "SC VivoCity (2km)",
    publicTransport: "Tuyến buýt 139, dự kiến metro số 4",
    mainRoads: "Nguyễn Hữu Thọ, Nguyễn Văn Linh",
    locationAdvantages: "Gần trung tâm hành chính Quận 7, nhiều tiện ích hiện hữu",
    locationDisadvantages: "Thường ngập nhẹ vào mùa mưa cao điểm",
    landUseDocs: "Đã cấp",
    constructionPermit: "Đã cấp",
    ownershipType: "Sở hữu lâu dài",
    startingPrice: 2_600_000_000,
    avgPricePerM2: 42_000_000,
    paymentPolicy: "Thanh toán 95% nhận nhà, 5% khi ra sổ",
    bankFinancingPolicy: "Hỗ trợ vay 70% qua Vietcombank, ân hạn gốc 12 tháng",
    commissionPolicy: "2% giá trị hợp đồng",
    managementFee: 14_000,
    maintenanceFee: 2,
  },
  {
    name: "The Marq",
    developer: "Hongkong Land",
    projectType: "can_ho",
    address: "29 Nguyễn Đình Chiểu, Quận 1",
    province: "TP. Hồ Chí Minh",
    district: "Quận 1",
    description: "Căn hộ hạng sang trung tâm Quận 1, mật độ xây dựng thấp.",
    constructionStatus: "handed_over",
    expectedHandover: "2021-03-01",
    totalArea: 1.1,
    totalUnits: 515,
    constructionDensity: 28,
    distanceToCenterKm: 1.2,
    nearbySchools: "Trường Mầm non Quốc tế (0.5km)",
    nearbyHospitals: "Bệnh viện Đại học Y Dược (1km)",
    nearbyShopping: "Diamond Plaza, Takashimaya (1km)",
    publicTransport: "Tuyến Metro số 1 (dự kiến), nhiều tuyến buýt trung tâm",
    mainRoads: "Nguyễn Đình Chiểu, Pasteur",
    locationAdvantages: "Vị trí lõi trung tâm, pháp lý minh bạch, chủ đầu tư uy tín quốc tế",
    locationDisadvantages: "Giá cao, ít quỹ căn trống",
    landUseDocs: "Đã cấp",
    constructionPermit: "Đã cấp",
    ownershipType: "Sở hữu lâu dài",
    startingPrice: 9_500_000_000,
    avgPricePerM2: 145_000_000,
    paymentPolicy: "Thanh toán theo tiến độ, đã hoàn thiện 100%",
    bankFinancingPolicy: "Hỗ trợ vay 50% qua HSBC",
    commissionPolicy: "2.5% giá trị hợp đồng",
    managementFee: 25_000,
    maintenanceFee: 2,
  },
  {
    name: "Aqua City",
    developer: "Novaland",
    projectType: "khu_do_thi",
    address: "Đường Lê Duẩn, Long Hưng",
    province: "Đồng Nai",
    district: "Biên Hòa",
    description: "Khu đô thị sinh thái ven sông Đồng Nai, đa dạng loại hình nhà phố, biệt thự.",
    constructionStatus: "under_construction",
    expectedHandover: "2026-12-01",
    totalArea: 305,
    totalUnits: 8000,
    constructionDensity: 22,
    distanceToCenterKm: 35,
    nearbySchools: "Quy hoạch trường liên cấp nội khu",
    nearbyHospitals: "Bệnh viện Đồng Nai (8km)",
    publicTransport: "Cao tốc TP.HCM - Long Thành - Dầu Giây liền kề",
    mainRoads: "Quốc lộ 51, cao tốc Long Thành - Dầu Giây",
    locationAdvantages: "Hưởng lợi hạ tầng sân bay Long Thành, quỹ đất lớn",
    locationDisadvantages: "Cách xa trung tâm TP.HCM, hạ tầng nội khu đang hoàn thiện",
    landUseDocs: "Một phần đã cấp, một phần đang hoàn thiện",
    constructionPermit: "Đã cấp theo từng phân khu",
    ownershipType: "Sở hữu lâu dài",
    startingPrice: 3_800_000_000,
    avgPricePerM2: 28_000_000,
    paymentPolicy: "Thanh toán 30 - 40% giữ chỗ, còn lại theo tiến độ 24 tháng",
    bankFinancingPolicy: "Hỗ trợ vay 70% qua Techcombank, ân hạn gốc 24 tháng",
    commissionPolicy: "3% giá trị hợp đồng",
  },
  {
    name: "Vinhomes Grand Park",
    developer: "Vinhomes",
    projectType: "can_ho",
    address: "Nguyễn Xiển, Quận 9 (TP. Thủ Đức)",
    province: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    description: "Đại đô thị quy mô lớn phía Đông TP.HCM, đầy đủ tiện ích nội khu.",
    constructionStatus: "handed_over",
    expectedHandover: "2023-01-01",
    totalArea: 271,
    totalUnits: 44000,
    constructionDensity: 30,
    distanceToCenterKm: 18,
    nearbySchools: "Hệ thống trường Vinschool nội khu",
    nearbyHospitals: "Bệnh viện Vinmec Quận 9 nội khu",
    nearbyShopping: "Vincom Mega Mall Grand Park",
    publicTransport: "Gần tuyến Metro số 1 (Bến xe Suối Tiên)",
    mainRoads: "Nguyễn Xiển, Vành đai 3 (quy hoạch)",
    locationAdvantages: "Tiện ích nội khu đồng bộ, dân cư đã về ở ổn định",
    locationDisadvantages: "Áp lực giao thông giờ cao điểm trên Nguyễn Xiển",
    landUseDocs: "Đã cấp",
    constructionPermit: "Đã cấp",
    ownershipType: "Sở hữu lâu dài",
    startingPrice: 2_200_000_000,
    avgPricePerM2: 38_000_000,
    paymentPolicy: "Thanh toán linh hoạt, đã hoàn thiện 100%",
    bankFinancingPolicy: "Hỗ trợ vay 65% qua Techcombank",
    commissionPolicy: "2% giá trị hợp đồng",
    managementFee: 12_000,
    maintenanceFee: 2,
  },
  {
    name: "Lakeview City",
    developer: "Khang Điền",
    projectType: "nha_pho",
    address: "Đường Nguyễn Văn Tạo, Quận 2 (TP. Thủ Đức)",
    province: "TP. Hồ Chí Minh",
    district: "TP. Thủ Đức",
    description: "Khu nhà phố, biệt thự ven hồ cảnh quan.",
    constructionStatus: "completed",
    expectedHandover: "2022-09-01",
    totalArea: 30,
    totalUnits: 650,
    constructionDensity: 40,
    distanceToCenterKm: 12,
    nearbySchools: "Trường Việt Úc (2km)",
    nearbyHospitals: "Bệnh viện Quận 2 (3km)",
    publicTransport: "Gần cao tốc Long Thành - Dầu Giây",
    mainRoads: "Mai Chí Thọ, Đồng Văn Cống",
    locationAdvantages: "Cảnh quan hồ trung tâm, mật độ xây dựng thấp",
    locationDisadvantages: "Hạ tầng kết nối khu vực còn hạn chế vào giờ cao điểm",
    landUseDocs: "Đã cấp",
    constructionPermit: "Đã cấp",
    ownershipType: "Sở hữu lâu dài",
    startingPrice: 12_000_000_000,
    avgPricePerM2: 95_000_000,
    paymentPolicy: "Thanh toán 95% nhận nhà, 5% ra sổ",
    bankFinancingPolicy: "Hỗ trợ vay 60% qua BIDV",
    commissionPolicy: "2% giá trị hợp đồng",
  },
];

const FIRST_NAMES = ["Nguyễn Văn", "Trần Thị", "Lê Minh", "Phạm Thị", "Hoàng Văn", "Đỗ Thị", "Vũ Minh", "Bùi Thị", "Đặng Văn", "Ngô Thị"];
const LAST_NAMES = ["An", "Bình", "Châu", "Dũng", "Em", "Giang", "Hà", "Khánh", "Linh", "Minh", "Nam", "Oanh", "Phúc", "Quân", "Sơn"];

function randomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export async function seedDemoData() {
  if (projectsCol.getAll().some((p) => p.isDemo)) return; // already seeded

  const now = new Date().toISOString();
  const projects: Project[] = PROJECT_SEEDS.map((seed) => ({
    ...seed,
    id: uuid(),
    images: [],
    documents: [],
    legalVerification: { status: "verified", lastVerifiedAt: now, source: "Hồ sơ chủ đầu tư" },
    createdAt: now,
    updatedAt: now,
    isDemo: true,
  }));
  await projectsCol.upsertMany(projects);

  const properties: Property[] = [];
  const scores: (ProductScore & { id: string })[] = [];
  const swots: (SwotAnalysis & { id: string })[] = [];
  const usps: (ProductUsp & { id: string })[] = [];

  const propertyTypesByProject: Record<string, Property["propertyType"]> = {
    "Sunrise Riverside": "can_ho",
    "The Marq": "can_ho",
    "Aqua City": "nha_pho",
    "Vinhomes Grand Park": "can_ho",
    "Lakeview City": "biet_thu",
  };

  const unitsPerProject = 6;
  projects.forEach((project, pIdx) => {
    const type = propertyTypesByProject[project.name] ?? "can_ho";
    for (let i = 0; i < unitsPerProject; i++) {
      const id = uuid();
      const area = type === "can_ho" ? rand(55, 120) : rand(100, 300);
      const pricePerM2 = (project.avgPricePerM2 ?? 40_000_000) * (0.9 + Math.random() * 0.25);
      const listingPrice = Math.round((area * pricePerM2) / 1_000_000) * 1_000_000;
      const discount = Math.random() > 0.6 ? Math.round((listingPrice * 0.02) / 1_000_000) * 1_000_000 : 0;
      const status: Property["status"] = pick([
        "available",
        "available",
        "available",
        "on_hold",
        "reserved",
        "sold",
        "pending_verification",
      ]);
      const legalStatus: Property["legalStatus"] = pick(["verified", "verified", "unverified", "pending"]);

      const property: Property = {
        id,
        projectId: project.id,
        name: `${project.name.split(" ")[0]}-${String.fromCharCode(65 + (i % 4))}${rand(3, 25)}-${String(rand(1, 20)).padStart(2, "0")}`,
        propertyType: type,
        transactionType: "sale",
        block: type === "can_ho" ? String.fromCharCode(65 + (i % 4)) : undefined,
        floor: type === "can_ho" ? String(rand(3, 25)) : undefined,
        unitNumber: String(rand(1, 20)).padStart(2, "0"),
        landArea: type === "can_ho" ? undefined : area,
        usableArea: type === "can_ho" ? area : Math.round(area * 0.6),
        bedrooms: type === "can_ho" ? pick([1, 2, 2, 3]) : pick([3, 4, 5]),
        bathrooms: type === "can_ho" ? pick([1, 2]) : pick([3, 4]),
        direction: pick(DIRECTIONS),
        balconyDirection: pick(DIRECTIONS),
        furnishing: pick(["tho", "co_ban", "day_du", "cao_cap"]),
        listingPrice,
        discount,
        finalPrice: listingPrice - discount,
        priceAreaBasis: type === "can_ho" ? "usable" : "land",
        commissionRate: 2,
        ownerSource: pick(["Chủ đầu tư", "Chủ nhà", "Môi giới F1"]),
        description: `${project.name.split(" ")[0]} - sản phẩm demo minh họa thuộc dự án ${project.name}.`,
        advantages: "Vị trí đẹp, view thoáng, bàn giao đúng tiến độ.",
        disadvantages: "Phí quản lý ở mức trung bình - cao so với khu vực.",
        images: [],
        legalStatus,
        legalSource: {
          status: legalStatus === "verified" ? "verified" : "unverified",
          lastVerifiedAt: legalStatus === "verified" ? now : undefined,
          source: legalStatus === "verified" ? "Hợp đồng mua bán + sổ hồng" : undefined,
        },
        availabilitySource: { status: "verified", lastVerifiedAt: now, source: "Cập nhật từ sàn demo" },
        status,
        tags: pIdx < 2 ? ["ưu tiên tư vấn"] : [],
        notes: undefined,
        createdAt: now,
        updatedAt: now,
        isDemo: true,
      };
      properties.push(property);

      const inputs = emptyScoreInputs();
      inputs.location.value = rand(55, 95);
      inputs.price.value = rand(40, 90);
      inputs.legal.value = legalStatus === "verified" ? rand(80, 100) : null;
      inputs.amenities.value = rand(50, 90);
      inputs.livability.value = rand(55, 95);
      inputs.investment.value = rand(40, 85);
      // liquidity intentionally left null for some to demonstrate partial coverage
      if (Math.random() > 0.3) inputs.liquidity.value = rand(40, 85);

      scores.push({
        id,
        propertyId: id,
        weights: { location: 20, price: 20, legal: 20, amenities: 10, livability: 10, investment: 10, liquidity: 10 },
        inputs,
        evaluatedAt: now,
      });

      swots.push({
        id,
        propertyId: id,
        strengths: ["Vị trí thuận tiện di chuyển trung tâm", "Thiết kế tối ưu diện tích sử dụng"],
        weaknesses: legalStatus !== "verified" ? ["Hồ sơ pháp lý chưa được xác minh đầy đủ"] : ["Phí quản lý cao hơn trung bình khu vực"],
        opportunities: ["Hạ tầng khu vực đang được đầu tư nâng cấp", "Nhu cầu thuê ở khu vực tăng"],
        threats: ["Nguồn cung tương lai từ các dự án lân cận", "Biến động lãi suất vay mua nhà"],
        updatedAt: now,
        approved: false,
      });

      usps.push({
        id,
        propertyId: id,
        topReasons: ["Vị trí kết nối tốt", "Mức giá cạnh tranh trong khu vực", "Chủ đầu tư có uy tín triển khai"],
        competitiveAdvantages: ["Tiến độ bàn giao đúng hẹn", "Pháp lý minh bạch hơn một số dự án lân cận"],
        differentiation: "Sản phẩm phù hợp cho khách mua để ở lâu dài với mức giá hợp lý theo khu vực.",
        idealCustomers: ["Gia đình trẻ mua để ở", "Nhà đầu tư trung hạn"],
        notSuitableFor: ["Khách cần bàn giao gấp dưới 3 tháng nếu đang xây dựng"],
        objections: [
          { objection: "Giá cao quá", response: "So với mặt bằng khu vực, mức giá này đã bao gồm tiện ích nội khu và chính sách hỗ trợ vay ưu đãi." },
          { objection: "Tôi lo ngại về pháp lý", response: "Anh/chị có thể yêu cầu xem trực tiếp hồ sơ pháp lý đã được xác minh trước khi đặt cọc." },
        ],
        elevatorPitch: "Sản phẩm vị trí tốt, giá cạnh tranh, phù hợp nhu cầu ở thực và đầu tư trung hạn.",
        updatedAt: now,
      });
    }
  });

  await propertiesCol.upsertMany(properties);
  await Promise.all([scoresCol.upsertMany(scores), swotCol.upsertMany(swots), uspCol.upsertMany(usps)]);

  const purposes: Customer["purpose"][] = [
    "mua_de_o",
    "mua_cho_gia_dinh",
    "dau_tu_tang_gia",
    "dau_tu_cho_thue",
    "giu_tai_san",
    "kinh_doanh",
  ];
  const stages: Customer["stage"][] = [
    "new_lead",
    "qualified",
    "consulting",
    "viewing",
    "negotiation",
    "reservation",
    "closed_won",
    "closed_lost",
  ];

  const customers: Customer[] = Array.from({ length: 15 }, (_, i) => {
    const budgetMin = rand(2, 8) * 1_000_000_000;
    const todayOffset = rand(-3, 5);
    const date = new Date();
    date.setDate(date.getDate() + todayOffset);
    return {
      id: uuid(),
      fullName: randomName(),
      phone: `09${rand(10000000, 99999999)}`,
      email: undefined,
      budgetMin,
      budgetMax: budgetMin + rand(1, 3) * 1_000_000_000,
      purpose: purposes[i % purposes.length],
      preferredPropertyType: pick(["can_ho", "nha_pho", "biet_thu"]),
      minArea: rand(45, 120),
      minBedrooms: pick([1, 2, 3]),
      essentialRequirements: "Pháp lý rõ ràng, gần trường học",
      timeline: pick(["Trong 1 tháng", "1-3 tháng", "Trên 3 tháng"]),
      stage: stages[i % stages.length],
      nextFollowUpDate: date.toISOString(),
      lastContactDate: now,
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
  });
  customersCol.upsertMany(customers);
}

export function clearDemoData() {
  const demoPropertyIds = propertiesCol.getAll().filter((p) => p.isDemo).map((p) => p.id);
  for (const id of demoPropertyIds) {
    scoresCol.remove(id);
    swotCol.remove(id);
    uspCol.remove(id);
    propertiesCol.remove(id);
  }
  for (const p of projectsCol.getAll().filter((p) => p.isDemo)) {
    projectsCol.remove(p.id);
  }
  for (const c of customersCol.getAll().filter((c) => c.isDemo)) {
    customersCol.remove(c.id);
  }
}
