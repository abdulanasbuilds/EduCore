"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateAssessmentModal } from "./create-assessment-modal";

interface AssessmentActionsProps {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  types: { id: string; name: string }[];
  activeTermId: string;
}

export function AssessmentActions({ classes, subjects, types, activeTermId }: AssessmentActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
      >
        <Plus className="h-4 w-4" />
        Create Assessment
      </button>

      {isOpen && (
        <CreateAssessmentModal 
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          classes={classes}
          subjects={subjects}
          types={types}
          activeTermId={activeTermId}
        />
      )}
    </>
  );
}
