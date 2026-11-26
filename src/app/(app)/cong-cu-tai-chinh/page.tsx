import { ComingSoon } from "@/components/layout/coming-soon";
import { Calculator } from "lucide-react";

export default function FinanceToolsPage() {
  return (
    <ComingSoon
      icon={Calculator}
      title="Công cụ tài chính"
      phase="Phase 3 — AI Sales Intelligence"
      description="Bộ công cụ tính toán tài chính và hiệu quả đầu tư để tư vấn khách hàng chính xác hơn."
      plannedFeatures={[
        "Tính vốn tự có, khoản vay, trả góp theo dư nợ giảm dần hoặc niên kim",
        "Lịch trả nợ theo mốc thanh toán và biểu đồ dòng tiền",
        "Tính lợi suất thuê gộp/ròng, điểm hoà vốn đầu tư",
        "Phân tích độ nhạy khi lãi suất tăng hoặc thu nhập thuê giảm",
        "Mọi kết quả được ghi rõ là ước tính, không phải cam kết lợi nhuận",
      ]}
    />
  );
}
