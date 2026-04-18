"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordPaymentAction } from "@/actions/fee-actions";
import { Search, Wallet, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecordPaymentPage() {
  const supabase = createClient() as any;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (search.length < 3) return;
    const { data } = await supabase
      .from("students")
      .select("id, full_name, admission_number")
      .or(`full_name.ilike.%${search}%,admission_number.ilike.%${search}%`)
      .limit(5);
    setStudents(data || []);
  };

  const selectStudent = async (student: any) => {
    setSelectedStudent(student);
    setStudents([]);
    const { data } = await supabase
      .from("student_fees")
      .select("*, fee_assignment:fee_assignments(*, fee_type:fee_types(name))")
      .eq("student_id", student.id)
      .neq("status", "Paid");
    setFees(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || fees.length === 0) return;

    setLoading(true);
    setError("");

    // Simple allocation to the first fee for now
    const result = await recordPaymentAction({
      studentFeeId: fees[0].id,
      studentId: selectedStudent.id,
      amount: Math.round(Number(amount) * 100),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: method as any,
    });

    if (result.success) {
      router.push("/bursar");
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Record Fee Payment</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <label className="block text-sm font-medium text-slate-700">Search Student</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or Admission Number"
              className="pl-10 pr-4 py-2 border rounded-md text-sm w-full min-h-[44px]"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 border rounded-md text-sm hover:bg-slate-50 min-h-[44px]"
          >
            Find
          </button>
        </div>

        {students.length > 0 && (
          <div className="border rounded-md divide-y overflow-hidden">
            {students.map(s => (
              <button 
                key={s.id}
                onClick={() => selectStudent(s)}
                className="w-full text-left p-3 hover:bg-slate-50 text-sm flex justify-between"
              >
                <span className="font-medium">{s.full_name}</span>
                <span className="text-slate-500 font-mono text-xs">{s.admission_number}</span>
              </button>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div className="p-4 bg-primary-50 rounded-md flex items-center justify-between border border-primary-100">
            <div>
              <p className="text-sm font-medium text-primary-900">{selectedStudent.full_name}</p>
              <p className="text-xs text-primary-700">{selectedStudent.admission_number}</p>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="text-xs text-primary-600 hover:underline">Change</button>
          </div>
        )}
      </div>

      {selectedStudent && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Outstanding Fees</h3>
            {fees.length === 0 ? (
              <p className="text-sm text-green-600">This student has no outstanding fees.</p>
            ) : (
              <div className="space-y-2">
                {fees.map(f => (
                  <div key={f.id} className="flex justify-between text-sm">
                    <span>{f.fee_assignment?.fee_type?.name}</span>
                    <span className="font-semibold text-red-600">GHS {(f.balance / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Amount (GHS)</label>
              <input 
                type="number" 
                step="0.01" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[44px]"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[44px]"
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button 
            type="submit"
            disabled={loading || fees.length === 0}
            className="w-full bg-primary-800 text-white py-3 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Recording..." : "Complete Payment"}
          </button>
        </form>
      )}
    </div>
  );
}
