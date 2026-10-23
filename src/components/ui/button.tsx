import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-1 disabled:opacity-55 disabled:pointer-events-none cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#635BCE] text-white hover:bg-[#524AB8] active:bg-[#433C9E] dark:bg-[#635BCE] dark:text-white dark:hover:bg-[#746DD6] border border-transparent shadow-xs",
      secondary:
        "bg-[#E9E8FC] text-[#252927] hover:bg-[#DDD9F9] active:bg-[#C5BFF3] dark:bg-[#252927] dark:text-[#F7F6F1] dark:hover:bg-[#2E3330] border border-[#D5D3F5] dark:border-[#3D433F]",
      outline:
        "bg-[#FFFFFF] text-[#252927] hover:bg-[#F7F6F1] active:bg-[#EFECE6] dark:bg-[#1C1F1D] dark:text-[#F7F6F1] dark:hover:bg-[#252927] border border-[#E5E4DE] dark:border-[#2E3330] shadow-xs",
      destructive:
        "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 dark:bg-red-600 dark:text-white dark:hover:bg-red-500 border border-transparent shadow-xs",
      ghost:
        "bg-transparent text-[#252927] hover:bg-[#E9E8FC]/60 active:bg-[#E9E8FC] dark:text-[#F7F6F1] dark:hover:bg-[#252927]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2 min-h-[40px] sm:min-h-[40px]",
      lg: "h-11 px-5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
