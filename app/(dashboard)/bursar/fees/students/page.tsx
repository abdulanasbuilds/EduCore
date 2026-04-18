import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Download, Filter, MessageSquare, History } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function BursarStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus = status || "all";

  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id, name")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const { data: feeAssignments } = await supabase
    .from("fee_assignments")
    .select("id, amount, fee_types(name), classes(name)")
    .eq("term_id", activeTerm?.id || "");

  const { data: studentFees } = await supabase
    .from("student_fees")
    .select(`
      *,
      fee_assignments(amount, due_date, fee_types(name)),
      students(full_name, admission_number, student_class_history(is_current, classes(name)))
    `)
    .in("fee_assignment_id", feeAssignments?.map((a: any) => a.id) || []);

  const aggregatedFees = new Map();

  studentFees?.forEach((fee: any) => {
    const student = fee.students;
    if (!student) return;
    
    const className = student.student_class_history?.find((h: any) => h.is_current)?.classes?.name || "Unknown";
    
    if (!aggregatedFees.has(fee.student_id)) {
      aggregatedFees.set(fee.student_id, {
        id: fee.student_id,
        name: student.full_name,
        adm: student.admission_number,
        className,
        amount_owed: 0,
        amount_paid: 0,
        balance: 0,
        status: "Paid",
        due_date: fee.fee_assignments?.due_date
      });
    }

    const current = aggregatedFees.get(fee.student_id);
    current.amount_owed += fee.amount_owed;
    current.amount_paid += fee.amount_paid;
    current.balance += fee.balance;
    
    if (current.balance > 0 && current.amount_paid > 0) current.status = "Partial";
    if (current.balance > 0 && current.amount_paid === 0) current.status = "Unpaid";
  });

  let displayData = Array.from(aggregatedFees.values());
  
  if (filterStatus !== "all") {
    displayData = displayData.filter((d: any) => d.status.toLowerCase() === filterStatus.toLowerCase());
  }

  // Sort by balance desc
  displayData.sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Fee Balances</h1>
          <p className="text-sm text-slate-500">Track outstanding payments for {activeTerm?.name || "Active Term"}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/bursar/payments/new" className="px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 min-h-[44px] flex items-center">
            Record Payment
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50">
          <div className="flex gap-2">
            <Link href="?status=all" className={`px-4 py-2 rounded-md text-sm font-medium border ${filterStatus === 'all' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-white hover:bg-slate-100 text-slate-700'}`}>All Students</Link>
            <Link href="?status=unpaid" className={`px-4 py-2 rounded-md text-sm font-medium border ${filterStatus === 'unpaid' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white hover:bg-slate-100 text-slate-700'}`}>Defaulters</Link>
            <Link href="?status=paid" className={`px-4 py-2 rounded-md text-sm font-medium border ${filterStatus === 'paid' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white hover:bg-slate-100 text-slate-700'}`}>Cleared</Link>
          </div>
          <button className="flex items-center gap-2 text-slate-600 hover:text-primary-800 text-sm font-medium">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {displayData.length === 0 ? (
          <EmptyState 
            icon="fees"
            title="No fee records found"
            description="Fee records are generated automatically when fees are set up and assigned."
            actionLabel="Setup Fees"
            actionHref="/bursar/fees/setup"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-right">Owed</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayData.map((d: any) => {
                  const isOverdue = d.balance > 0 && new Date(d.due_date) < new Date();
                  
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.adm}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{d.className}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        ₵{(d.amount_owed / 100).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">
                        ₵{(d.amount_paid / 100).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        ₵{(d.balance / 100).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          d.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          d.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {d.status}
                        </span>
                        {isOverdue && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">OVERDUE</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-slate-800 tooltip-trigger" title="Payment History">
                          <History className="h-5 w-5" />
                        </button>
                        {d.balance > 0 && (
                          <button className="text-amber-500 hover:text-amber-700 tooltip-trigger" title="Send SMS Reminder">
                            <MessageSquare className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
