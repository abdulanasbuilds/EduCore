import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Wallet, History, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

export default async function BursarPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  // Get active term
  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const stats = { collected: 0, outstanding: 0, defaulters: 0 };

  if (activeTerm) {
    const { data: feeRecords } = await supabase
      .from("student_fees")
      .select("amount_paid, balance, status")
      .eq("fee_assignment:fee_assignments(term_id)", activeTerm.id);

    if (feeRecords) {
      stats.collected = feeRecords.reduce((sum: number, r: any) => sum + (r.amount_paid || 0), 0) / 100;
      stats.outstanding = feeRecords.reduce((sum: number, r: any) => sum + (r.balance || 0), 0) / 100;
      stats.defaulters = feeRecords.filter((r: any) => r.status !== 'Paid').length;
    }
  }

  const { data: recentPayments } = await supabase
    .from("fee_payments")
    .select("*, students(full_name, admission_number)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
        <div className="flex gap-3">
          <Link 
            href="/bursar/fees/setup"
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 min-h-[44px]"
          >
            Fee Setup
          </Link>
          <Link 
            href="/bursar/payments/new"
            className="px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Collected this Term" value={`GHS ${stats.collected.toLocaleString()}`} icon={<Wallet className="text-emerald-600" />} />
        <StatCard title="Total Outstanding" value={`GHS ${stats.outstanding.toLocaleString()}`} icon={<AlertCircle className="text-amber-600" />} />
        <StatCard title="Defaulters" value={stats.defaulters} icon={<History className="text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-lg">Recent Payments</h3>
            <Link href="/bursar/payments" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          {!recentPayments || recentPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No payments recorded recently.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-nowrap">Receipt #</th>
                    <th className="px-6 py-4 text-nowrap">Student</th>
                    <th className="px-6 py-4 text-nowrap text-right">Amount</th>
                    <th className="px-6 py-4 text-nowrap">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs">{p.receipt_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{(p.students as any)?.full_name}</p>
                        <p className="text-xs text-slate-500">{(p.students as any)?.admission_number}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                        GHS {(p.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-slate-800 text-lg mb-4 border-b pb-2">Quick Reminders</h3>
          <ul className="space-y-4">
            <li className="text-sm">
              <p className="font-medium text-slate-800">7 Days Before Due</p>
              <p className="text-xs text-slate-500">Automatic SMS will fire tomorrow at 8:00 AM.</p>
            </li>
            <li className="text-sm">
              <p className="font-medium text-slate-800">Due Date Today</p>
              <p className="text-xs text-slate-500">45 students have fees due today.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
