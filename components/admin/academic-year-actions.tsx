"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CreateAcademicYearModal } from "./academic-year-modal";
import { openTermAction, closeTermAction, setCurrentYearAction } from "@/actions/academic-actions";
import { useRouter } from "next/navigation";

export function AcademicYearActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Handle events from server-rendered buttons
  useEffect(() => {
    const handleOpen = async (e: any) => {
      if (confirm("Opening this term will close any other active term in this school. Continue?")) {
        const res = await openTermAction(e.detail);
        if (res.success) router.refresh();
        else alert(res.message);
      }
    };

    const handleClose = async (e: any) => {
      if (confirm("Are you sure you want to close this term? This will lock all grades and attendance records.")) {
        const res = await closeTermAction(e.detail);
        if (res.success) router.refresh();
        else alert(res.message);
      }
    };

    const handleCurrent = async (e: any) => {
      const res = await setCurrentYearAction(e.detail);
      if (res.success) router.refresh();
      else alert(res.message);
    };

    document.addEventListener('openTerm', handleOpen);
    document.addEventListener('closeTerm', handleClose);
    document.addEventListener('setCurrentYear', handleCurrent);

    return () => {
      document.removeEventListener('openTerm', handleOpen);
      document.removeEventListener('closeTerm', handleClose);
      document.removeEventListener('setCurrentYear', handleCurrent);
    };
  }, [router]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
      >
        <Plus className="h-4 w-4" />
        Create New Year
      </button>

      <CreateAcademicYearModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
