"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function PayrollPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;
      const [{ data: st }, { data: rec }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, role").eq("school_id", profile.school_id).in("role", ["class_teacher", "subject_teacher", "bursar"]).order("full_name"),
        supabase.from("payroll_records").select("*").eq("month", month).eq("year", year).order("paid_on", { ascending: false }),
      ]);
      setStaff(st || []);
      setRecords(rec || []);
      setLoading(false);
    }
    load();
  }, [month, year]);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <div className="flex gap-4 items-center">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="border p-2 rounded">
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="border p-2 rounded">
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No payroll records for {format(new Date(year, month-1), "MMMM yyyy")}. Add salary records to see them here.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 font-medium text-slate-600">Staff Name</th>
                <th className="p-4 font-medium text-slate-600">Role</th>
                <th className="p-4 font-medium text-slate-600 text-right">Gross Salary</th>
                <th className="p-4 font-medium text-slate-600 text-right">Deductions</th>
                <th className="p-4 font-medium text-slate-600 text-right">Net Salary</th>
                <th className="p-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => {
                const teacher = staff.find(s => s.id === r.teacher_id);
                return (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-medium">{teacher?.full_name || "Unknown"}</td>
                    <td className="p-4 text-slate-500 capitalize">{teacher?.role?.replace("_"," ") || "—"}</td>
                    <td className="p-4 text-right">GHS {(r.gross_salary / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right">GHS {(r.deductions / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold">GHS {((r.gross_salary - r.deductions) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${r.paid_on ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {r.paid_on ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
