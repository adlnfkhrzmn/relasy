"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RelasyLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const RelasyLogo: React.FC<RelasyLogoProps> = ({
  size = "md",
  showText = true,
  subtitle = "",
  className,
}) => {
  const markSize = {
    sm: "w-6 h-7",
    md: "w-7 h-8",
    lg: "w-9 h-10",
  }[size];

  const wordmarkSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none",
        className
      )}
    >
      {/* Official Relasy Geometric Lowercase 'r' Mark */}
      <svg
        viewBox="0 0 92 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", markSize)}
        aria-hidden="true"
      >
        {/* Top-left quarter-circle segment */}
        <path
          d="M0 0H40C40 22.0914 22.0914 40 0 40V0Z"
          className="fill-[#635BCE] dark:fill-[#7B74E8]"
        />
        {/* Bottom-left vertical stem */}
        <rect
          x="0"
          y="40"
          width="40"
          height="64"
          className="fill-[#635BCE] dark:fill-[#7B74E8]"
        />
        {/* Top-right rounded lobe */}
        <path
          d="M40 40V30C40 13.4315 53.4315 0 70 0H72C83.0457 0 92 8.9543 92 20C92 31.0457 83.0457 40 72 40H40Z"
          className="fill-[#635BCE] dark:fill-[#7B74E8]"
        />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className={cn(
              "font-semibold tracking-[-0.03em] leading-none text-[#252927] dark:text-[#F7F6F1]",
              wordmarkSize
            )}
          >
            relasy
          </span>
          {subtitle && (
            <span className="text-[10px] font-medium text-[#6F716D] dark:text-[#A8AAA4] mt-0.5 leading-none">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
