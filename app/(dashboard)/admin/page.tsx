import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Basic stats fetching
  const [{ count: studentCount }, { count: classCount }, { count: teacherCount }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "Active"),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "CLASS_TEACHER"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={studentCount || 0} />
        <StatCard title="Total Classes" value={classCount || 0} />
        <StatCard title="Total Teachers" value={teacherCount || 0} />
        <StatCard title="Today's Attendance" value="92%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-4">Alerts</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              12 students have attendance below 75%
            </li>
            <li className="flex items-center gap-2 text-sm text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              5 teachers have missing grades for Mid-Term
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              45 students have outstanding fee balances
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <ul className="space-y-4">
            <li className="text-sm">
              <p className="font-medium text-slate-800">Attendance marked for Primary 4</p>
              <p className="text-xs text-slate-500">10 minutes ago by Mr. Smith</p>
            </li>
            <li className="text-sm">
              <p className="font-medium text-slate-800">Fee payment received: GHS 500</p>
              <p className="text-xs text-slate-500">1 hour ago</p>
            </li>
            <li className="text-sm">
              <p className="font-medium text-slate-800">New student enrolled: John Doe</p>
              <p className="text-xs text-slate-500">3 hours ago</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col">
      <span className="text-sm text-slate-500 font-medium">{title}</span>
      <span className="text-3xl font-bold text-slate-800 mt-2">{value}</span>
    </div>
  );
}