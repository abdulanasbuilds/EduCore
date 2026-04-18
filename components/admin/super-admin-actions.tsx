"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateSchoolModal } from "./create-school-modal";

export function SuperAdminActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Register New School
      </button>

      {isOpen && (
        <CreateSchoolModal 
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
