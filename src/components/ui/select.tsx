import React from "react";
import { cn } from "@/lib/utils";
import { MarkChevronDown } from "@/components/ui/marks";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, required, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[#252927]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-desc` : undefined}
            className={cn(
              "w-full appearance-none rounded-md border bg-[#FFFFFF] pl-3 pr-9 py-2 text-sm text-[#252927] transition-colors cursor-pointer",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(37,41,39,0.05)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent",
              "disabled:cursor-not-allowed disabled:bg-[#F7F6F1] disabled:text-[#A8AAA4]",
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-[#E5E4DE] hover:border-[#D5D4CD]",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <MarkChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F716D]" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-desc`} className="text-xs text-[#6F716D]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
