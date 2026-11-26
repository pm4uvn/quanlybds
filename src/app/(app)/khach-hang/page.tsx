import { ComingSoon } from "@/components/layout/coming-soon";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Khách hàng"
      phase="Phase 2 — Customer Intelligence"
      description="CRM cá nhân nhẹ cho môi giới: hồ sơ khách hàng, pipeline bán hàng và lịch chăm sóc."
      plannedFeatures={[
        "Hồ sơ khách hàng: ngân sách, mục đích mua, yêu cầu bắt buộc/tuỳ chọn",
        "Pipeline Kanban: Khách mới → Sàng lọc → Tư vấn → Xem nhà → Đàm phán → Đặt cọc → Thành công/Thất bại",
        "Lịch sử tương tác và nhắc lịch follow-up",
        "Danh sách sản phẩm đã giới thiệu cho từng khách hàng",
      ]}
    />
  );
}
