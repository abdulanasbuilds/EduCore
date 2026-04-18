import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BursarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as any;

  if (!profile || !["BURSAR", "SUPER_ADMIN", "SCHOOL_ADMIN"].includes(profile.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary-800 text-white shadow-sm h-16 flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold">EduCore Bursar</h2>
        <form action="/auth/signout" method="post">
          <button className="text-sm hover:underline">Logout</button>
        </form>
      </header>
      <main className="p-6 flex-1 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
