"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  MarkLedger,
  MarkContacts,
  MarkFunnel,
  MarkSchedule,
  MarkSettings,
} from "@/components/ui/marks";

export type NavMark = (props: { className?: string }) => React.JSX.Element;

export const navigationItems: {
  name: string;
  href: string;
  icon: NavMark;
}[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: MarkLedger,
  },
  {
    name: "Pelanggan",
    href: "/pelanggan",
    icon: MarkContacts,
  },
  {
    name: "Pipeline penjualan",
    href: "/pipeline",
    icon: MarkFunnel,
  },
  {
    name: "Follow-up",
    href: "/follow-up",
    icon: MarkSchedule,
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: MarkSettings,
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
          item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/ringkasan"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target no-underline overflow-hidden",
              isActive
                ? "text-[#252927] font-semibold"
                : "text-[#6F716D] hover:text-[#252927] hover:bg-[#F7F6F1]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active-pill"
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-lg bg-[#E9E8FC] border border-[#D5D3F5]"
              />
            )}
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#635BCE] z-10" />
            )}
            <Icon
              className={cn(
                "relative z-10 w-4 h-4 shrink-0 transition-colors duration-150",
                isActive
                  ? "text-[#635BCE]"
                  : "text-[#6F716D] group-hover:text-[#252927]"
              )}
            />
            <span className="relative z-10 truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
