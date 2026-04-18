import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, School, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";

export default async function SuperAdminSchoolsPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: schools } = await supabase.from("schools").select("*").order("name");

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Registered Schools</h1>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">School Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {schools?.map((s: any) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-bold">{s.name}</td>
                <td className="px-6 py-4">{s.email || s.phone}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/super-admin/schools/${s.id}`} className="text-primary-600 font-bold hover:underline">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
