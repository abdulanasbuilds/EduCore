import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, School, Settings, Globe, Shield } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";

export default async function SuperAdminPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "SUPER_ADMIN") redirect("/admin");

  const { count: schoolCount } = await supabase.from("schools").select("*", { count: "exact", head: true });
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });

  const { data: schools } = await supabase
    .from("schools")
    .select("*, profiles!profiles_school_id_fkey(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Shield className="h-6 w-6 text-primary-400" />
          <h1 className="text-xl font-bold tracking-tight">EduCore <span className="text-slate-400 font-normal ml-2">Platform Engine</span></h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-medium">System Administrator</span>
          <form action="/auth/signout" method="post">
            <button className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
          </form>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Schools" value={schoolCount || 0} icon={<School className="text-blue-500" />} />
          <StatCard title="Active Students" value={studentCount || 0} icon={<Globe className="text-emerald-500" />} />
          <StatCard title="System Health" value="100%" icon={<Settings className="text-amber-500" />} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Managed Schools</h2>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
              Register New School
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">School Name</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                          {s.name.charAt(0)}
                        </div>
                        <p className="font-bold text-slate-900 group-hover:text-primary-600">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{s.address || "No address provided"}</td>
                    <td className="px-6 py-5">
                      <p className="text-slate-900 font-medium">{s.phone}</p>
                      <p className="text-slate-500 text-xs">{s.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-primary-600 hover:text-primary-700 font-bold px-3 py-1.5 rounded-md hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100">
                        Manage Instance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
