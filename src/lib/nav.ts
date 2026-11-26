import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  LineChart,
  GitCompareArrows,
  Users,
  Target,
  Bot,
  Calculator,
  GraduationCap,
  Settings,
  Sunrise,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard, mobile: true },
  { href: "/du-an", label: "Dự án", icon: Building2 },
  { href: "/kho-san-pham", label: "Kho sản phẩm", icon: Boxes, mobile: true },
  { href: "/phan-tich", label: "Phân tích sản phẩm", icon: LineChart },
  { href: "/so-sanh", label: "So sánh", icon: GitCompareArrows },
  { href: "/khach-hang", label: "Khách hàng", icon: Users, mobile: true, comingSoon: true },
  { href: "/ghep-san-pham", label: "Ghép sản phẩm", icon: Target, comingSoon: true },
  { href: "/tro-ly-ban-hang", label: "Trợ lý bán hàng", icon: Bot, mobile: true, comingSoon: true },
  { href: "/cong-cu-tai-chinh", label: "Công cụ tài chính", icon: Calculator, comingSoon: true },
  { href: "/kien-thuc", label: "Kiến thức", icon: GraduationCap, comingSoon: true },
  { href: "/cai-dat", label: "Cài đặt", icon: Settings },
];

export const BRAND = {
  name: "Realty360",
  tagline: "Hiểu sản phẩm – Hiểu khách hàng – Bán hàng hiệu quả.",
  icon: Sunrise,
};
