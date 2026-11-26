import { ComingSoon } from "@/components/layout/coming-soon";
import { Target } from "lucide-react";

export default function MatchingPage() {
  return (
    <ComingSoon
      icon={Target}
      title="Ghép sản phẩm"
      phase="Phase 2 — Customer Intelligence"
      description="Công cụ gợi ý ghép khách hàng với sản phẩm phù hợp dựa trên ràng buộc cứng và điểm phù hợp có trọng số."
      plannedFeatures={[
        "Lọc theo ràng buộc cứng: ngân sách, loại hình, vị trí, số phòng ngủ, pháp lý bắt buộc",
        "Điểm phù hợp có trọng số theo ngân sách, vị trí, mục đích mua, khả năng tài chính, thời gian mua",
        "Giải thích rõ lý do phù hợp/không phù hợp cho từng gợi ý",
        "Gợi ý hành động tiếp theo và cách xử lý từ chối dự kiến",
      ]}
    />
  );
}
