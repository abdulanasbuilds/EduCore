import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">EduCore <span className="text-primary-400 text-xs font-mono border border-primary-400/30 px-1.5 py-0.5 rounded">Platform Admin</span></h1>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-slate-400 hover:text-white transition-colors">Sign Out</button>
        </form>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 hidden md:block">
          <nav className="space-y-1">
            <a href="/super-admin" className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/10 text-white font-medium">Dashboard</a>
            <a href="/super-admin/schools" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5">Schools</a>
            <a href="/super-admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5">System Settings</a>
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
