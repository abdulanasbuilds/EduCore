"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function BursarDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
      </div>
      <EmptyState
        icon="fees"
        title="Fee Management Module"
        description="This module handles all fee assignments, payments, and receipts. Implementation in progress."
      />
    </div>
  );
}
