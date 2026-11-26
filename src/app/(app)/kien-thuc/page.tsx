import { ComingSoon } from "@/components/layout/coming-soon";
import { GraduationCap } from "lucide-react";

export default function AcademyPage() {
  return (
    <ComingSoon
      icon={GraduationCap}
      title="Kiến thức"
      phase="Phase 3 — AI Sales Intelligence"
      description="Trung tâm học tập dành cho môi giới mới: kiến thức sản phẩm, kỹ năng tư vấn và xử lý từ chối."
      plannedFeatures={[
        "Bài học ngắn theo chủ đề: pháp lý, vị trí, giá bán, vay ngân hàng, đầu tư",
        "Thẻ ghi nhớ, quiz hàng ngày và từ điển thuật ngữ bất động sản",
        "Bài tập tình huống thực tế theo kịch bản khách hàng",
        "Theo dõi tiến độ học tập và ghi chú cá nhân",
      ]}
    />
  );
}
