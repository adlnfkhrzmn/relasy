import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#252927]">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={cn(
            "w-full rounded-md border bg-[#FFFFFF] px-3 py-2 text-sm text-[#252927] placeholder:text-[#A8AAA4] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:border-transparent",
            "disabled:cursor-not-allowed disabled:bg-[#F7F6F1] disabled:text-[#A8AAA4]",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-[#E5E4DE] hover:border-[#D5D4CD]",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-desc`} className="text-xs text-[#6F716D]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
