"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function ParentFeesPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      
      const { data: studentData } = await supabase
        .from("students")
        .select("full_name, admission_number")
        .eq("id", id)
        .single();
        
      const { data: fees } = await supabase
        .from("student_fees")
        .select("*, fee_assignments(*, fee_types(name))")
        .eq("student_id", id);
        
      setStudent(studentData);
      setData(fees || []);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  if (loading) return <DashboardSkeleton />;

  const totalOwed = data.reduce((acc, f) => acc + f.amount_owed, 0);
  const totalPaid = data.reduce((acc, f) => acc + f.amount_paid, 0);
  const balance = totalOwed - totalPaid;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/parent" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Fee Statement</h1>
          <p className="text-sm text-slate-500">{student?.full_name} • {student?.admission_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Owed</p>
            <p className="text-2xl font-black text-slate-800">₵{(totalOwed / 100).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Paid</p>
            <p className="text-2xl font-black text-green-600">₵{(totalPaid / 100).toFixed(2)}</p>
        </div>
        <div className="bg-primary-800 p-6 rounded-xl border shadow-md text-white">
            <p className="text-sm font-medium opacity-70 mb-1">Outstanding Balance</p>
            <p className="text-3xl font-black">₵{(balance / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Term Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Fee Type</th>
                  <th className="px-6 py-4 text-right">Owed</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No fee records found.</td>
                    </tr>
                ) : data.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{f.fee_assignments?.fee_types?.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Assignment #{f.id.slice(0,8)}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">₵{(f.amount_owed / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">₵{(f.amount_paid / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-black">₵{(f.balance / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            f.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                            f.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {f.status}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-slate-500" />
        </div>
        <div className="text-sm text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 mb-1">Payment Instructions</p>
            School fees can be paid via Mobile Money at the school office or through bank transfer to the official institutional account. Please always include the Student Admission Number as the reference for all payments.
        </div>
      </div>
    </div>
  );
}
