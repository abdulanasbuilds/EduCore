"use client";

import { useState } from "react";
import { Plus, Download, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setupFeesAction } from "@/actions/fee-actions";
import { useRouter } from "next/navigation";
import type { FeeType, Class, Term } from "@/types";

interface FeeSetupClientProps {
  feeTypes: FeeType[];
  classes: Class[];
  activeTerm: Term;
}

export function FeeSetupClient({ feeTypes, classes, activeTerm }: FeeSetupClientProps) {
  const [assignments, setAssignments] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleAmountChange = (classId: string, feeTypeId: string, amount: string) => {
    const value = parseFloat(amount) || 0;
    setAssignments((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] || {}),
        [feeTypeId]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const assignmentList = [];
      for (const classId of Object.keys(assignments)) {
        for (const feeTypeId of Object.keys(assignments[classId])) {
          const amount = assignments[classId][feeTypeId];
          if (amount > 0) {
            assignmentList.push({
              classId,
              feeTypeId,
              amount: Math.round(amount * 100), // Convert to cents/pesewas
              dueDate: activeTerm.fee_due_date,
            });
          }
        }
      }

      if (assignmentList.length === 0) {
        setMessage({ type: "error", text: "Please enter at least one fee amount." });
        setLoading(false);
        return;
      }

      const result = await setupFeesAction({
        termId: activeTerm.id,
        assignments: assignmentList,
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium flex justify-between items-center ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-semibold text-slate-800 text-lg">Assign Fees to Classes</h3>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 min-h-[44px] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Assignments"}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3 border-r">Class</th>
                {feeTypes.map((ft) => (
                  <th key={ft.id} className="px-4 py-3 min-w-[140px] text-center border-r">
                    {ft.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 border-r">{c.name}</td>
                  {feeTypes.map((ft) => (
                    <td key={ft.id} className="px-4 py-3 border-r">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₵</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={assignments[c.id]?.[ft.id] ?? ""}
                          onChange={(e) => handleAmountChange(c.id, ft.id, e.target.value)}
                          placeholder="0.00"
                          className="pl-8 pr-3 py-2 border rounded text-sm w-full outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm border border-amber-200">
          <p className="flex items-center gap-2 font-bold mb-1">
            <Plus className="h-4 w-4" /> Final Step Required
          </p>
          Saving assignments will automatically create fee records for all active students in these classes. This process is irreversible for the current term.
        </div>
      </div>
    </div>
  );
}
