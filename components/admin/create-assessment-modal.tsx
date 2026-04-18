"use client";

import { useState } from "react";
import { Search, Plus, Save, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createAssessmentAction, deleteAssessmentAction } from "@/actions/grade-actions";

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  types: { id: string; name: string }[];
  activeTermId: string;
}

export function CreateAssessmentModal({ isOpen, onClose, classes, subjects, types, activeTermId }: CreateAssessmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subjectId: "",
    assessmentTypeId: "",
    date: new Date().toISOString().split("T")[0],
    maxScore: 100,
  });
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createAssessmentAction({
      ...formData,
      termId: activeTermId,
    });

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
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">New Assessment</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <Plus className="h-5 w-5 rotate-45 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-md min-h-[44px]"
              placeholder="e.g. Mid-Term Math Test"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select 
                required
                value={formData.classId}
                onChange={(e) => setFormData({...formData, classId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md min-h-[44px]"
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select 
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md min-h-[44px]"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                required
                value={formData.assessmentTypeId}
                onChange={(e) => setFormData({...formData, assessmentTypeId: e.target.value})}
                className="w-full px-3 py-2 border rounded-md min-h-[44px]"
              >
                <option value="">Select Type</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
              <input 
                required
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-md min-h-[44px]"
            />
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 border rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 min-h-[44px]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-primary-800 text-white rounded-md text-sm font-bold hover:bg-primary-700 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? "Creating..." : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
