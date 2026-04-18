import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface ProfileData {
  role: string;
  school_id: string | null;
  full_name: string;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, school_id, full_name")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileData | null;

  if (!profile || (profile.role !== "SCHOOL_ADMIN" && profile.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/students", label: "Students", icon: "🎓" },
    { href: "/admin/classes", label: "Classes", icon: "🏫" },
    { href: "/admin/teachers", label: "Teachers", icon: "👨‍🏫" },
    { href: "/admin/attendance", label: "Attendance", icon: "✅" },
    { href: "/admin/grades", label: "Grades", icon: "📝" },
    { href: "/admin/fees", label: "Fees", icon: "💰" },
    { href: "/admin/reports", label: "Reports", icon: "📈" },
    { href: "/admin/announcements", label: "Announcements", icon: "📢" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">EduCore</h1>
          <p className="text-sm opacity-80 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Term 1 (2024/2025)</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">{profile.full_name}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-red-600 hover:underline">Logout</button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}