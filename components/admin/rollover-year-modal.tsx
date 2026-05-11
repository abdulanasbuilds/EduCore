"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Copy, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { rolloverYearAction } from "@/actions/academic-actions";
import { useRouter } from "next/navigation";
import { format, addYears } from "date-fns";

interface RolloverYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolloverYearModal({ isOpen, onClose }: RolloverYearModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [yearOptions, setYearOptions] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [sourceYear, setSourceYear] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    terms: [
      { name: "Term 1", termNumber: 1, startDate: "", endDate: "", feeDueDate: "" },
      { name: "Term 2", termNumber: 2, startDate: "", endDate: "", feeDueDate: "" },
      { name: "Term 3", termNumber: 3, startDate: "", endDate: "", feeDueDate: "" },
    ],
  });
  const supabase = createClient() as any;
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      supabase.from("academic_years").select("id, name, start_date, end_date, terms(*)").order("start_date", { ascending: false }).then(({ data }: any) => {
        if (data) setYearOptions(data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSourceId) {
      const yr = yearOptions.find((y: any) => y.id === selectedSourceId);
      setSourceYear(yr || null);
      if (yr) {
        const start = new Date(yr.start_date);
        const end = new Date(yr.end_date);
        const nextStart = addYears(start, 1);
        const nextEnd = addYears(end, 1);
        const yrNameParts = yr.name.split("/");
        const nextName = yrNameParts.length === 2
          ? `${parseInt(yrNameParts[0]) + 1}/${parseInt(yrNameParts[1]) + 1}`
          : `${parseInt(yr.name) + 1}`;
        setFormData({
          name: nextName,
          startDate: format(nextStart, "yyyy-MM-dd"),
          endDate: format(nextEnd, "yyyy-MM-dd"),
          terms: yr.terms
            ? yr.terms.slice().sort((a: any, b: any) => a.term_number - b.term_number).map((t: any, i: number) => ({
                name: t.name,
                termNumber: i + 1,
                startDate: format(addYears(new Date(t.start_date), 1), "yyyy-MM-dd"),
                endDate: format(addYears(new Date(t.end_date), 1), "yyyy-MM-dd"),
                feeDueDate: format(addYears(new Date(t.fee_due_date), 1), "yyyy-MM-dd"),
              }))
            : [
                { name: "Term 1", termNumber: 1, startDate: "", endDate: "", feeDueDate: "" },
                { name: "Term 2", termNumber: 2, startDate: "", endDate: "", feeDueDate: "" },
                { name: "Term 3", termNumber: 3, startDate: "", endDate: "", feeDueDate: "" },
              ],
        });
      }
    }
  }, [selectedSourceId, yearOptions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId) { alert("Please select a source year"); return; }
    setLoading(true);
    const res = await rolloverYearAction(selectedSourceId, formData);
    setResult(res);
    if (res.success) {
      setTimeout(() => {
        router.refresh();
        onClose();
        setResult(null);
        setSelectedSourceId("");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-emerald-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Year Rollover</h2>
              <p className="text-sm text-slate-500">Copy classes, subjects, timetable, and fee structures from an existing year</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Copy from Academic Year</label>
            <select
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[44px] bg-white"
              required
            >
              <option value="">Select source year...</option>
              {yearOptions.map((y: any) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
            {sourceYear && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Will copy: {sourceYear.terms?.length || 0} terms, classes, subjects, timetable, fee assignments, promotion rules
              </p>
            )}
          </div>

          {selectedSourceId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">New Year Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 border-b pb-2">
                  <Copy className="h-4 w-4 text-emerald-600" /> Terms
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formData.terms.map((term, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-emerald-800">{term.name}</h4>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Starts</label>
                        <input
                          required
                          type="date"
                          value={term.startDate}
                          onChange={(e) => {
                            const newTerms = [...formData.terms];
                            (newTerms[i] as any).startDate = e.target.value;
                            setFormData({ ...formData, terms: newTerms });
                          }}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Ends</label>
                        <input
                          required
                          type="date"
                          value={term.endDate}
                          onChange={(e) => {
                            const newTerms = [...formData.terms];
                            (newTerms[i] as any).endDate = e.target.value;
                            setFormData({ ...formData, terms: newTerms });
                          }}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 text-red-600">Fee Due Date</label>
                        <input
                          required
                          type="date"
                          value={term.feeDueDate}
                          onChange={(e) => {
                            const newTerms = [...formData.terms];
                            (newTerms[i] as any).feeDueDate = e.target.value;
                            setFormData({ ...formData, terms: newTerms });
                          }}
                          className="w-full px-2 py-1.5 border rounded text-sm border-red-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {result && (
            <div className={`text-sm px-4 py-3 rounded-lg font-medium ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {result.success ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> {result.message}</span>
              ) : result.message}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 min-h-[44px]">Cancel</button>
            <button
              type="submit"
              disabled={loading || !selectedSourceId}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50 min-h-[44px] flex items-center gap-2"
            >
              {loading ? "Creating..." : <><RefreshCw className="w-4 h-4" /> Rollover Year</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}