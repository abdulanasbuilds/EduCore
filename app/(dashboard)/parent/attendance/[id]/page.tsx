"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function ParentAttendancePage({ params }: { params: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const { data: att } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", id)
        .order("date", { ascending: false });
      setData(att);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Record</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((a: any) => (
              <tr key={a.id}>
                <td className="px-6 py-4 font-medium">{a.date}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{a.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
