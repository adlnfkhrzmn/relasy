import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  href?: string;
  variant?: "default" | "warning" | "success" | "danger";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  href,
  variant = "default",
}) => {
  const variantStyles = {
    default: "text-blue-700 bg-blue-50 border-blue-100",
    warning: "text-amber-700 bg-amber-50 border-amber-100",
    success: "text-emerald-700 bg-emerald-50 border-emerald-100",
    danger: "text-red-700 bg-red-50 border-red-100",
  };

  const content = (
    <div
      className={cn(
        "p-5 bg-white rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all",
        href && "cursor-pointer group"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={cn("p-2 rounded-md border", variantStyles[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
};
