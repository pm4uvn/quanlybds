"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const PRIMARY = NAV_ITEMS.filter((i) => i.mobile);
const MORE = NAV_ITEMS.filter((i) => !i.mobile);

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground border-t border-sidebar-border grid grid-cols-5 h-16 print:hidden">
      {PRIMARY.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px]",
              active ? "text-sidebar-ring" : "text-sidebar-foreground/70"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-1 text-[11px] text-sidebar-foreground/70">
            <Menu className="size-5" />
            Thêm
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Thêm chức năng</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 p-4">
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs"
              >
                <item.icon className="size-5 text-primary" />
                <span>{item.label}</span>
                {item.comingSoon && (
                  <Badge variant="outline" className="text-[10px]">
                    Sắp có
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
