export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await (supabase.auth as any).getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "parent") {
    redirect("/login");
  }

  const navLinks = [
    { href: "/parent", label: "Dashboard" },
    { href: "/parent/assignments", label: "Assignments" },
    { href: "/parent/behaviour", label: "Behaviour" },
    { href: "/parent/events", label: "Events" },
    { href: "/parent/timetable", label: "Timetable" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary-800 text-white shadow-sm h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-semibold whitespace-nowrap">Parent Portal</h2>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm hover:underline">Logout</button>
        </form>
      </header>
      <main className="p-6 flex-1 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

