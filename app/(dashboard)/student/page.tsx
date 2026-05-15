export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { BookOpen, CalendarCheck, Star } from "lucide-react";

export default async function StudentDashboardPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, admission_number")
    .eq("id", user.id)
    .single();

  let pendingAssignments = 0;
  let attendancePercent = 0;
  if (student) {
    const { count } = await supabase.from("assignments").select("id", { count: "exact", head: true }).gt("due_date", new Date().toISOString());
    pendingAssignments = count || 0;

    const { data: att } = await supabase.from("attendance").select("status").eq("student_id", student.id);
    const total = att?.length || 0;
    const present = att?.filter((a: any) => a.status === "Present").length || 0;
    attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome, {student?.full_name?.split(" ")[0] || "Student"}
      </h1>
      <p className="text-sm text-slate-500">{student?.admission_number}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Assignments" value={pendingAssignments} icon={<BookOpen className="h-5 w-5 text-indigo-600" />} />
        <StatCard title="Attendance Rate" value={`${attendancePercent}%`} icon={<CalendarCheck className="h-5 w-5 text-emerald-600" />} />
        <StatCard title="Class Rank" value="—" icon={<Star className="h-5 w-5 text-amber-600" />} />
      </div>
    </div>
  );
}
