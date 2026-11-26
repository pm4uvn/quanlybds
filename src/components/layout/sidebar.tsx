"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, BRAND } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border print:hidden">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <BRAND.icon className="size-6 text-sidebar-ring" />
        <div>
          <div className="font-semibold leading-tight">{BRAND.name}</div>
          <div className="text-[10px] text-sidebar-foreground/60 leading-tight">
            Sales Intelligence
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.comingSoon && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-sidebar-ring/50 text-sidebar-ring px-1.5 py-0"
                >
                  Sắp có
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50">
        {BRAND.tagline}
      </div>
    </aside>
  );
}
