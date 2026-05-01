"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Plus } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Broadcast messages to parents and students.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-center p-12">
        <p className="text-slate-500">Announcements module coming soon.</p>
      </div>
    </div>
  );
}

