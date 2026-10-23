import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarkArrowUpRight } from "@/components/ui/marks";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
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
    default: "text-[#635BCE] bg-[#E9E8FC] border-[#D5D3F5]",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    success: "text-emerald-700 bg-emerald-50 border-emerald-200",
    danger: "text-red-700 bg-red-50 border-red-200",
  };

  const content = (
    <div
      className={cn(
        "p-5 bg-[#FFFFFF] rounded-xl border border-[#E5E4DE] shadow-2xs hover:border-[#635BCE]/60 transition-all flex flex-col justify-between h-full",
        href && "cursor-pointer group"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold text-[#6F716D] uppercase tracking-wider">
            {title}
          </p>
          <div
            className={cn(
              "w-7 h-7 rounded-[6px] border flex items-center justify-center shrink-0",
              variantStyles[variant]
            )}
          >
            <Icon className="w-[15px] h-[15px]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#252927]">
            {value}
          </div>
        </div>
      </div>

      {description && (
        <div className="mt-3 pt-2.5 border-t border-[#E5E4DE] flex items-center justify-between gap-2">
          <p className="text-xs text-[#6F716D] truncate">{description}</p>
          {href && (
            <MarkArrowUpRight className="w-3.5 h-3.5 text-[#6F716D] group-hover:text-[#635BCE] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full no-underline">
        {content}
      </Link>
    );
  }

  return content;
};
