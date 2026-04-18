"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm border flex flex-col", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 font-medium">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <span className="text-3xl font-bold text-slate-800">{value}</span>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 mt-2">
          {trendValue && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-slate-500"
              )}
            >
              {trend === "up" && "+"}{trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
