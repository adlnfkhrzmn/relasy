"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarCheck2,
  Settings,
} from "lucide-react";

export const navigationItems = [
  {
    name: "Ringkasan",
    href: "/ringkasan",
    icon: LayoutDashboard,
  },
  {
    name: "Pelanggan",
    href: "/pelanggan",
    icon: Users,
  },
  {
    name: "Pipeline penjualan",
    href: "/pipeline",
    icon: Kanban,
  },
  {
    name: "Follow-up",
    href: "/follow-up",
    icon: CalendarCheck2,
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
  },
];

interface NavLinksProps {
  onItemClick?: () => void;
  className?: string;
}

export const NavLinks: React.FC<NavLinksProps> = ({ onItemClick, className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)} aria-label="Navigasi Utama">
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/ringkasan"
            ? pathname === "/ringkasan" || pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors touch-target",
              isActive
                ? "bg-blue-50 text-blue-800 font-semibold border-l-3 border-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "w-4 h-4 shrink-0",
                isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
              )}
              aria-hidden="true"
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
