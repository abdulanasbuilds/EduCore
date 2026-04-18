import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { School, MapPin, Phone, Mail, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "SUPER_ADMIN") redirect("/admin");

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();

  if (!school) return <EmptyState title="School not found" description="The school you requested could not be found." />;

  const { data: staff } = await supabase
    .from("profiles")
    .select("*")
    .eq("school_id", id)
    .in("role", ["SCHOOL_ADMIN", "CLASS_TEACHER", "SUBJECT_TEACHER", "BURSAR"]);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, level, capacity")
    .eq("school_id", id)
    .order("level");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white h-16 flex items-center px-6 sticky top-0 z-50">
        <Link href="/super-admin" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-8 flex items-start gap-6">
          <div className="h-24 w-24 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <School className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{school.name}</h1>
                <div className="flex gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /> {school.address || "No address"}</span>
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-slate-400" /> {school.phone || "No phone"}</span>
                  <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-slate-400" /> {school.email || "No email"}</span>
                </div>
              </div>
              <button className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors">
                Impersonate Admin
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" /> Staff Directory
              </h2>
            </div>
            <div className="divide-y">
              {staff?.map((s: any) => (
                <div key={s.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-900">{s.full_name}</p>
                    <p className="text-sm text-slate-500">{s.email}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold tracking-wide">
                    {s.role.replace("_", " ")}
                  </span>
                </div>
              ))}
              {!staff?.length && <p className="p-6 text-center text-slate-500">No staff registered yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <School className="h-5 w-5 text-emerald-500" /> Classes
              </h2>
            </div>
            <div className="divide-y">
              {classes?.map((c: any) => (
                <div key={c.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-500">Level {c.level} • Cap: {c.capacity}</p>
                </div>
              ))}
              {!classes?.length && <p className="p-6 text-center text-slate-500">No classes configured yet.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
