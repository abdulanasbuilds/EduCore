export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";

export default async function TeacherLayout({
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

  if (!profile || !["class_teacher", "subject_teacher", "school_admin"].includes(profile.role)) {
    redirect("/login");
  }

  const navLinks = [
    { href: "/teacher", label: "My Dashboard" },
    { href: "/teacher/attendance", label: "Attendance — Mark Today" },
    { href: "/teacher/grades", label: "Grades — Enter Grades" },
    { href: "/teacher/assignments", label: "Homework — Assignments" },
    { href: "/teacher/timetable", label: "Timetable" },
    { href: "/teacher/announcements", label: "Announcements" },
    { href: "/teacher/profile", label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-primary-800 text-white shadow-sm h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-semibold whitespace-nowrap">Teacher Portal</h2>
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
      <main className="p-6 flex-1 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

