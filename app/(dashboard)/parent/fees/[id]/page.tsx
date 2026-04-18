"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function ParentFeesPage({ params }: { params: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const { data: fees } = await supabase
        .from("student_fees")
        .select("*, fee_assignments(*, fee_types(name))")
        .eq("student_id", id);
      setData(fees);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fee Statement</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Fee Type</th>
              <th className="px-6 py-4 text-right">Owed</th>
              <th className="px-6 py-4 text-right">Paid</th>
              <th className="px-6 py-4 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((f: any) => (
              <tr key={f.id}>
                <td className="px-6 py-4 font-medium">{f.fee_assignments?.fee_types?.name}</td>
                <td className="px-6 py-4 text-right">₵{(f.amount_owed / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-emerald-600">₵{(f.amount_paid / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-red-600 font-bold">₵{(f.balance / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
