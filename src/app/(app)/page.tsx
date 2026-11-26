"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useProjects, useProperties, useCustomers } from "@/lib/use-repo";
import {
  availabilityDistribution,
  computeKpis,
  customerBudgetDistribution,
  pipelineDistribution,
  priceDistribution,
  projectDistribution,
  typeDistribution,
} from "@/lib/dashboard";
import { generateInsights } from "@/lib/insights";
import { formatVnd, formatVndFull } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Boxes,
  CheckCircle2,
  Clock,
  Wallet,
  Star,
  TrendingUp,
  Users,
  CalendarClock,
  HandCoins,
  Ruler,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

const CHART_COLORS = ["#142D40", "#158575", "#C5A46D", "#2563EB", "#DC2626", "#9CB1C2"];

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
            {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
          </div>
          <div className="rounded-lg bg-secondary/10 p-2">
            <Icon className="size-4 text-secondary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const projects = useProjects();
  const properties = useProperties();
  const customers = useCustomers();

  const kpis = useMemo(() => {
    const base = computeKpis(properties, customers);
    return { ...base, totalProjects: projects.length };
  }, [properties, customers, projects.length]);

  const priceData = useMemo(() => priceDistribution(properties), [properties]);
  const typeData = useMemo(() => typeDistribution(properties), [properties]);
  const projectData = useMemo(() => projectDistribution(properties, projects), [properties, projects]);
  const availabilityData = useMemo(() => availabilityDistribution(properties), [properties]);
  const budgetData = useMemo(() => customerBudgetDistribution(customers), [customers]);
  const pipelineData = useMemo(() => pipelineDistribution(customers), [customers]);
  const insights = useMemo(() => generateInsights(properties, customers), [properties, customers]);

  const isEmpty = projects.length === 0 && properties.length === 0;

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Bức tranh tổng thể về sản phẩm, khách hàng và hiệu quả bán hàng của bạn."
        actions={
          <Button asChild>
            <Link href="/kho-san-pham">+ Thêm sản phẩm</Link>
          </Button>
        }
      />

      {isEmpty ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Boxes className="size-10 text-muted-foreground mx-auto mb-3" />
            <div className="font-medium mb-1">Chưa có dữ liệu</div>
            <p className="text-sm text-muted-foreground mb-4">
              Bắt đầu bằng cách tạo dự án hoặc thêm sản phẩm vào kho hàng của bạn.
            </p>
            <Button asChild>
              <Link href="/du-an">Tạo dự án đầu tiên</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <KpiCard icon={Building2} label="Tổng số dự án" value={String(kpis.totalProjects)} />
            <KpiCard icon={Boxes} label="Tổng số sản phẩm" value={String(kpis.totalProperties)} />
            <KpiCard icon={CheckCircle2} label="Sản phẩm còn hàng" value={String(kpis.available)} />
            <KpiCard icon={Clock} label="Đang giữ chỗ / đặt cọc" value={String(kpis.onHold)} />
            <KpiCard icon={Star} label="Ưu tiên tư vấn" value={String(kpis.priority)} />
            <KpiCard icon={TrendingUp} label="Đã bán" value={String(kpis.sold)} />
            <KpiCard icon={Wallet} label="Tổng giá trị hàng đang bán" value={formatVnd(kpis.totalInventoryValue)} sub={formatVndFull(kpis.totalInventoryValue)} />
            <KpiCard icon={HandCoins} label="Giá bán trung bình" value={formatVnd(kpis.avgPrice)} />
            <KpiCard icon={Ruler} label="Giá trung bình / m²" value={formatVnd(kpis.avgPricePerM2)} />
            <KpiCard icon={Users} label="Khách hàng tiềm năng" value={String(kpis.activeCustomers)} />
            <KpiCard icon={CalendarClock} label="Follow-up hôm nay" value={String(kpis.followUpsToday)} />
            <KpiCard icon={HandCoins} label="Hoa hồng dự kiến" value={formatVnd(kpis.expectedCommission)} />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="size-4 text-accent" />
                Nhận định thông minh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((i) => (
                <div key={i.id} className="flex items-start gap-2 text-sm">
                  {i.tone === "warning" ? (
                    <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-4 text-secondary mt-0.5 shrink-0" />
                  )}
                  <span>{i.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ChartCard title="Phân bổ theo khoảng giá">
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#142D40" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Phân bổ theo loại hình">
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="label" outerRadius={90} label>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>

            <ChartCard title="Phân bổ theo dự án">
              <BarChart data={projectData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#158575" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Tình trạng hàng tồn">
              <PieChart>
                <Pie data={availabilityData} dataKey="count" nameKey="label" outerRadius={90} label>
                  {availabilityData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>

            <ChartCard title="Nhu cầu khách hàng theo ngân sách">
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#C5A46D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Pipeline khách hàng">
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#142D40" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
