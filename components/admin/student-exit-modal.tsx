"use client";

import { useState } from "react";
import { X, LogOut, FileText } from "lucide-react";
import { withdrawStudentAction } from "@/actions/student-actions";
import { useRouter } from "next/navigation";

interface StudentExitModalProps {
  studentId: string;
  studentName: string;
}

export function StudentExitModal({ studentId, studentName }: StudentExitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exitDate, setExitDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("Transfer");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const fullReason = notes ? `${reason} - ${notes}` : reason;
    const result = await withdrawStudentAction(studentId, fullReason, exitDate);
    
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full text-left px-3 py-2 rounded text-sm font-medium hover:bg-red-50 text-red-600 flex items-center gap-2 min-h-[44px]"
      >
        <LogOut className="h-4 w-4" />
        Withdraw Student
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Withdraw {studentName}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {success ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Student Withdrawn</h3>
                <p className="text-slate-600 text-sm">
                  {studentName} has been successfully withdrawn. Their academic records have been locked.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button className="w-full bg-primary-800 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 min-h-[44px]">
                    Download Leaving Certificate
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full border py-2.5 rounded-md font-medium hover:bg-slate-50 text-slate-700 min-h-[44px]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
                  <strong>Warning:</strong> This action will mark the student as withdrawn and lock their current academic records. This action can be reversed by an administrator later if necessary.
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Exit Date</label>
                  <input 
                    type="date" 
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Reason</label>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                  >
                    <option value="Transfer">Transfer to another school</option>
                    <option value="Financial">Financial difficulties</option>
                    <option value="Relocation">Family relocation</option>
                    <option value="Expulsion">Expulsion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Additional Notes (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Provide any additional context..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 min-h-[44px]"
                  >
                    {loading ? "Processing..." : "Confirm Withdrawal"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
