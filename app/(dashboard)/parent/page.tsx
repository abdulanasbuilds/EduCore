"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Parent Portal</h1>
      </div>
      <EmptyState
        icon="students"
        title="Parent Portal"
        description="View grades, attendance, and fee status for your children. Implementation in progress."
      />
    </div>
  );
}
