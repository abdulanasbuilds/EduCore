"use client";

import Link from "next/link";
import { FileQuestion, Users, BookOpen, ClipboardList, Receipt, BarChart3 } from "lucide-react";

interface EmptyStateProps {
  icon?: "students" | "grades" | "attendance" | "fees" | "reports" | "default";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const iconMap = {
  students: Users,
  grades: BookOpen,
  attendance: ClipboardList,
  fees: Receipt,
  reports: BarChart3,
  default: FileQuestion,
};

export function EmptyState({
  icon = "default",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-primary-800 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors min-h-[44px] inline-flex items-center"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
