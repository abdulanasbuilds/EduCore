import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { AttendanceChart, FeeCollectionChart } from "@/components/admin/dashboard-charts";
import { Users, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = (await createClient()) as any;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user?.id || "")
    .single();

  const schoolId = profile?.school_id;

  // Fetch basic stats
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId || "")
    .eq("status", "Active");

  // Get current term
  const { data: currentTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("school_id", schoolId || "")
    .eq("status", "active")
    .single();

  let totalCollected = 0;
  let totalOutstanding = 0;

  if (currentTerm) {
    // Get fee stats for current term assignments
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

  // Mock data for charts
  const attendanceData = [
    { date: "Mon", present: 95 },
    { date: "Tue", present: 92 },
    { date: "Wed", present: 96 },
    { date: "Thu", present: 88 },
    { date: "Fri", present: 91 },
  ];

  const feeData = [
    { month: "Sep", amount: 15000 },
    { month: "Oct", amount: 45000 },
    { month: "Nov", amount: 12000 },
    { month: "Dec", amount: 5000 },
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
          title="Today's Attendance" 
          value="92%" 
          trend="down"
          trendValue="2%"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
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
          {/* Charts */}
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
          {/* Alerts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Action Required
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Low Attendance Alerts</p>
                  <p className="text-xs text-slate-500 mb-1">12 students below 75% threshold</p>
                  <Link href="/admin/attendance/reports" className="text-xs text-primary-600 hover:underline">View details</Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Missing Grades</p>
                  <p className="text-xs text-slate-500 mb-1">5 teachers haven&apos;t submitted Mid-Term</p>
                  <Link href="/admin/grades" className="text-xs text-primary-600 hover:underline">Send reminders</Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Overdue Fees</p>
                  <p className="text-xs text-slate-500 mb-1">45 students have outstanding balances</p>
                  <Link href="/admin/fees" className="text-xs text-primary-600 hover:underline">View defaulters</Link>
                </div>
              </li>
            </ul>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800">Recent Activity</h3>
            <ul className="space-y-4">
              <li className="text-sm border-l-2 border-slate-200 pl-3">
                <p className="font-medium text-slate-800">Attendance marked for Primary 4</p>
                <p className="text-xs text-slate-500">10 minutes ago by Mr. Smith</p>
              </li>
              <li className="text-sm border-l-2 border-slate-200 pl-3">
                <p className="font-medium text-slate-800">Fee payment received: GHS 500</p>
                <p className="text-xs text-slate-500">1 hour ago by Bursar</p>
              </li>
              <li className="text-sm border-l-2 border-slate-200 pl-3">
                <p className="font-medium text-slate-800">New student enrolled: John Doe</p>
                <p className="text-xs text-slate-500">3 hours ago by Admin</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
