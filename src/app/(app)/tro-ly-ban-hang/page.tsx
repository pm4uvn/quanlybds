import { ComingSoon } from "@/components/layout/coming-soon";
import { Bot } from "lucide-react";

export default function AssistantPage() {
  return (
    <ComingSoon
      icon={Bot}
      title="Trợ lý bán hàng"
      phase="Phase 3 — AI Sales Intelligence"
      description="Trợ lý AI hỗ trợ hỏi đáp sản phẩm, tạo kịch bản bán hàng, xử lý từ chối và luyện tập roleplay với khách hàng."
      plannedFeatures={[
        "Hỏi đáp tự nhiên dựa trên dữ liệu sản phẩm đã lưu trong kho",
        "Tạo kịch bản: liên hệ đầu tiên, tư vấn điện thoại, Zalo, xem nhà, đàm phán, chốt sale",
        "Gợi ý xử lý từ chối thường gặp của khách hàng",
        "Roleplay AI mô phỏng các dạng khách hàng và chấm điểm kỹ năng tư vấn",
        "Chuẩn bị bán hàng hàng ngày: follow-up, sản phẩm nên giới thiệu, kiến thức cần ôn",
      ]}
    />
  );
}
