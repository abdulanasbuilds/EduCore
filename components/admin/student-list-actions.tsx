"use client";

import { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, Plus } from "lucide-react";
import { CSVImportModal } from "./csv-import-modal";

interface StudentListActionsProps {
  classes: { id: string; name: string }[];
}

export function StudentListActions({ classes }: StudentListActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 min-h-[44px] flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Import CSV
        </button>
        <Link
          href="/admin/students/new"
          className="px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {isModalOpen && (
        <CSVImportModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          classes={classes} 
        />
      )}
    </>
  );
}
