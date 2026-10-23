import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#E5E4DE] rounded-lg bg-[#F7F6F1]/60",
        className
      )}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-[#E9E8FC] flex items-center justify-center text-[#635BCE] mb-3 border border-[#D5D3F5]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#252927] mb-1">{title}</h3>
      <p className="text-xs text-[#6F716D] max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
