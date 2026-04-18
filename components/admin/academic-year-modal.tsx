"use client";

import { useState } from "react";
import { Plus, Download, Save, X, Calendar } from "lucide-react";
import { createAcademicYearAction, openTermAction, closeTermAction } from "@/actions/academic-actions";
import { useRouter } from "next/navigation";

interface AcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAcademicYearModal({ isOpen, onClose }: AcademicYearModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    terms: [
      { name: "Term 1", termNumber: 1, startDate: "", endDate: "", feeDueDate: "" },
      { name: "Term 2", termNumber: 2, startDate: "", endDate: "", feeDueDate: "" },
      { name: "Term 3", termNumber: 3, startDate: "", endDate: "", feeDueDate: "" },
    ]
  });

  if (!isOpen) return null;

  const handleTermChange = (index: number, field: string, value: string) => {
    const newTerms = [...formData.terms];
    (newTerms[index] as any)[field] = value;
    setFormData({ ...formData, terms: newTerms });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createAcademicYearAction(formData);
    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">New Academic Year</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Year Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 2025/2026" className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
              <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
              <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary-600" /> Configure Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formData.terms.map((term, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-primary-800">{term.name}</h4>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Starts</label>
                    <input required type="date" value={term.startDate} onChange={e => handleTermChange(i, "startDate", e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Ends</label>
                    <input required type="date" value={term.endDate} onChange={e => handleTermChange(i, "endDate", e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 text-red-600">Fee Due Date</label>
                    <input required type="date" value={term.feeDueDate} onChange={e => handleTermChange(i, "feeDueDate", e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm border-red-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-8 py-2.5 border rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 min-h-[44px]">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-2.5 bg-primary-800 text-white rounded-md text-sm font-bold hover:bg-primary-700 shadow-md transition-all active:scale-95 disabled:opacity-50 min-h-[44px]">
              {loading ? "Creating..." : "Initialize Academic Year"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
