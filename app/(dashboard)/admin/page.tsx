export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { AttendanceChart, FeeCollectionChart } from "@/components/admin/dashboard-charts";
import { Users, AlertTriangle, CheckCircle2, Wallet, BookOpen, Bell } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = (await createClient()) as any;

  const { data: { user } } = await (supabase.auth as any).getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user?.id || "")
    .single();

  const schoolId = profile?.school_id;

  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId || "")
    .eq("status", "Active");

  const { data: currentTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("school_id", schoolId || "")
    .eq("status", "active")
    .single();

  let totalCollected = 0;
  let totalOutstanding = 0;

  if (currentTerm) {
    const { data: assignments } = await supabase
      .from("fee_assignments")
      .select("id")
      .eq("term_id", currentTerm.id);
    if (assignments && assignments.length > 0) {
      const assignmentIds = assignments.map((a: any) => a.id);
      const { data: feeData } = await supabase
        .from("student_fees")
        .select("amount_owed, amount_paid, balance")
        .in("fee_assignment_id", assignmentIds);
      if (feeData) {
        totalCollected = feeData.reduce((sum: number, fee: any) => sum + (fee.amount_paid || 0), 0) / 100;
        totalOutstanding = feeData.reduce((sum: number, fee: any) => sum + (fee.balance || 0), 0) / 100;
      }
    }
  }

  const { data: events } = await supabase
    .from("school_events")
    .select("id")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .eq("school_id", schoolId || "")
    .order("event_date")
    .limit(10);

  const { count: homeworkCount } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId || "")
    .eq("is_published", true)
    .gte("due_date", new Date().toISOString().split("T")[0]);

  const { count: behaviourCount } = await supabase
    .from("behavior_logs")
    .select("id", { count: "exact", head: true })
    .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

  const { data: overdueBooks } = await supabase
    .from("book_issues")
    .select("id", { count: "exact" })
    .eq("status", "overdue")
    .eq("books.school_id", schoolId || "");

  const { data: recentPayments } = await supabase
    .from("fee_payments")
    .select("id, amount, payment_date, created_at, students(full_name), profiles!fee_payments_recorded_by_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: behaviourLogs } = await supabase
    .from("behavior_logs")
    .select("id, type, date, created_at, students(full_name), profiles!behavior_logs_logged_by_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const attendanceData = [
    { date: "Mon", present: 95 }, { date: "Tue", present: 92 },
    { date: "Wed", present: 96 }, { date: "Thu", present: 88 }, { date: "Fri", present: 91 },
  ];

  const feeData = [
    { month: "Sep", amount: 15000 }, { month: "Oct", amount: 45000 },
    { month: "Nov", amount: 12000 }, { month: "Dec", amount: 5000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={studentCount || 0}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Homework Due Today"
          value={homeworkCount || 0}
          icon={<CheckCircle2 className="h-5 w-5 text-indigo-600" />}
        />
        <StatCard
          title="Behaviour Incidents"
          value={behaviourCount || 0}
          trend="up"
          trendValue="this week"
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          title="Library Overdue"
          value={overdueBooks?.length || 0}
          icon={<Wallet className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Events"
          value={events?.length || 0}
          icon={<Bell className="h-5 w-5 text-purple-600" />}
        />
        <StatCard
          title="Fees Collected"
          value={`GHS ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Outstanding Fees"
          value={`GHS ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-6 text-slate-800">Attendance Overview</h3>
            <AttendanceChart data={attendanceData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-6 text-slate-800">Fee Collection Trend</h3>
            <FeeCollectionChart data={feeData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Action Required
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Missing Grades</p>
                  <p className="text-xs text-slate-500 mb-1">Some teachers haven&apos;t submitted assessments</p>
                  <Link href="/admin/grades" className="text-xs text-primary-600 hover:underline">View details</Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Overdue Fees</p>
                  <p className="text-xs text-slate-500 mb-1">Students with outstanding balances</p>
                  <Link href="/admin/finance" className="text-xs text-primary-600 hover:underline">View defaulters</Link>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800">Recent Activity</h3>
            <ul className="space-y-4">
              {recentPayments?.map((p: any) => (
                <li key={p.id} className="text-sm border-l-2 border-slate-200 pl-3">
                  <p className="font-medium text-slate-800">Fee payment: GHS {p.amount / 100}</p>
                  <p className="text-xs text-slate-500">
                    {p.students?.full_name} — {new Date(p.created_at).toLocaleDateString("en-GB")}
                  </p>
                </li>
              ))}
              {behaviourLogs?.map((b: any) => (
                <li key={b.id} className={`text-sm border-l-2 pl-3 ${b.type === "negative" ? "border-red-400" : "border-green-400"}`}>
                  <p className="font-medium text-slate-800">Behaviour: {b.type}</p>
                  <p className="text-xs text-slate-500">
                    {b.students?.full_name} — {new Date(b.created_at).toLocaleDateString("en-GB")}
                  </p>
                </li>
              ))}
              {(!recentPayments?.length && !behaviourLogs?.length) && (
                <li className="text-sm text-slate-400 italic">No recent activity</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
