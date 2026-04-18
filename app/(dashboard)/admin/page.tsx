"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/students", label: "Students", icon: "people" },
  { href: "/admin/teachers", label: "Teachers", icon: "school" },
  { href: "/admin/classes", label: "Classes", icon: "class" },
  { href: "/admin/subjects", label: "Subjects", icon: "book" },
  { href: "/admin/attendance", label: "Attendance", icon: "check" },
  { href: "/admin/grades", label: "Grades", icon: "grade" },
  { href: "/admin/fees", label: "Fees", icon: "payment" },
  { href: "/admin/reports", label: "Reports", icon: "assessment" },
];

interface ProfileData {
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string; role?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single() as { data: ProfileData | null };

      setUser({ email: user.email, role: profile?.role });

      if (profile?.role !== "SCHOOL_ADMIN" && profile?.role !== "SUPER_ADMIN") {
        router.push("/teacher");
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">EduCore Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">{user.email}</span>
            <button
              onClick={() => {
                supabase.auth.signOut();
                router.push("/login");
              }}
              className="text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-slate-800">{item.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage {item.label.toLowerCase()}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Today&apos;s Attendance</h3>
            <p className="text-3xl font-bold text-accent">92%</p>
            <p className="text-sm text-muted-foreground">Across all classes</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Fees Collected</h3>
            <p className="text-3xl font-bold text-accent">GHS 45,230</p>
            <p className="text-sm text-muted-foreground">This term</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Total Students</h3>
            <p className="text-3xl font-bold text-primary">1,247</p>
            <p className="text-sm text-muted-foreground">Active students</p>
          </div>
        </div>
      </main>
    </div>
  );
}