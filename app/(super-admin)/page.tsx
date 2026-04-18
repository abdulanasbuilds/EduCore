import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { Building2, Users, GraduationCap, ShieldCheck } from "lucide-react";

export default async function SuperAdminDashboard() {
  const supabase = (await createClient()) as any;

  const { count: schoolCount } = await supabase.from("schools").select("*", { count: "exact", head: true });
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
  const { count: teacherCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "CLASS_TEACHER");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-slate-400 mt-1">Global statistics across all school instances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Schools" 
          value={schoolCount || 0} 
          className="bg-slate-900 border-slate-800 text-white"
          icon={<Building2 className="h-5 w-5 text-primary-400" />}
        />
        <StatCard 
          title="Total Students" 
          value={studentCount || 0} 
          className="bg-slate-900 border-slate-800 text-white"
          icon={<Users className="h-5 w-5 text-blue-400" />}
        />
        <StatCard 
          title="Total Teachers" 
          value={teacherCount || 0} 
          className="bg-slate-900 border-slate-800 text-white"
          icon={<GraduationCap className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          className="bg-slate-900 border-slate-800 text-white"
          icon={<ShieldCheck className="h-5 w-5 text-purple-400" />}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Recent School Registrations</h3>
        <div className="text-slate-400 text-sm italic py-10 text-center border border-dashed border-slate-800 rounded-lg">
          No recent registrations in the last 7 days.
        </div>
      </div>
    </div>
  );
}
