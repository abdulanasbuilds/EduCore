import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles")
    .select("id, school_id, full_name, is_active")
    .eq("id", user.id).single();
  if (!profile?.school_id || !profile.is_active) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);
  const { data: term } = await supabase.from("terms")
    .select("id, name, academic_year_id")
    .eq("school_id", profile.school_id).eq("status", "active").single();

  const { data: classRow } = await supabase.from("classes")
    .select("id, name, level")
    .eq("school_id", profile.school_id).eq("class_teacher_id", profile.id).single();

  if (!classRow) return <div className="p-6 text-center text-amber-700 bg-amber-50 rounded-lg">You are not assigned as a class teacher to any class.</div>;

  const { data: history } = await supabase.from("student_class_history")
    .select("student_id, students(id, full_name, admission_number, status)")
    .eq("class_id", classRow.id).eq("academic_year_id", term?.academic_year_id || "").eq("is_current", true);
  const students = (history || []).map((r: any) => r.students).filter((s: any) => s?.status === "Active");
  const ids = students.map((s: any) => s.id);
  const empty = "00000000-0000-0000-0000-000000000000";

  const { data: todayAttendance } = await supabase.from("attendance")
    .select("student_id, status").eq("class_id", classRow.id).eq("term_id", term?.id || empty).eq("date", today);
  const attendanceMap: Record<string, string> = {};
  (todayAttendance || []).forEach((a: any) => attendanceMap[a.student_id] = a.status);
  const presentToday = (todayAttendance || []).filter((a: any) => a.status === "Present").length;
  const absentToday = (todayAttendance || []).filter((a: any) => a.status === "Absent").length;
  const lateToday = (todayAttendance || []).filter((a: any) => a.status === "Late").length;

  const { data: termAttendance } = await supabase.from("attendance")
    .select("student_id, status").eq("class_id", classRow.id).eq("term_id", term?.id || empty).in("student_id", ids.length ? ids : [empty]);
  const attendanceByStudent: Record<string, { present: number; total: number }> = {};
  (termAttendance || []).forEach((a: any) => {
    attendanceByStudent[a.student_id] ??= { present: 0, total: 0 };
    attendanceByStudent[a.student_id].total += 1;
    if (a.status === "Present" || a.status === "Late") attendanceByStudent[a.student_id].present += 1;
  });

  const { data: grades } = await supabase.from("grades")
    .select("student_id, score, assessments!inner(title, max_score, date, is_published, term_id, subjects(name))")
    .in("student_id", ids.length ? ids : [empty])
    .eq("assessments.term_id", term?.id || empty).eq("assessments.is_published", true);
  const latest: Record<string, any> = {};
  (grades || []).forEach((g: any) => {
    if (!latest[g.student_id] || new Date(g.assessments.date) > new Date(latest[g.student_id].assessments.date)) latest[g.student_id] = g;
  });

  const { data: pending } = await supabase.from("assessments")
    .select("id").eq("school_id", profile.school_id).eq("class_id", classRow.id)
    .eq("term_id", term?.id || empty).eq("is_published", false).lte("date", today);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <div><h1 className="text-2xl font-bold text-slate-800">Welcome, {profile.full_name.split(" ")[0]}</h1><p className="text-sm text-slate-500">Class: <strong>{classRow.name}</strong> · {students.length} active students</p></div>
        <p className="text-sm text-slate-500 text-right">{format(new Date(), "EEEE, dd MMMM yyyy")}<br/><strong>{term?.name || "No Active Term"}</strong></p>
      </div>

      {!todayAttendance?.length ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-amber-700"/><div><p className="font-bold text-amber-900">Attendance not marked today</p><p className="text-sm text-amber-800">Mark the class before leaving.</p></div></div><Link href="/teacher/attendance" className="px-4 py-2 rounded-lg bg-amber-700 text-white font-semibold">Mark Attendance</Link></div>
      ) : <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-green-700"/><p className="font-semibold text-green-800">Today: {presentToday} present · {absentToday} absent · {lateToday} late</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Students</p><p className="text-3xl font-extrabold mt-1">{students.length}</p></div><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Attendance Today</p><p className="text-3xl font-extrabold mt-1">{students.length ? Math.round((presentToday / students.length) * 100) : 0}%</p></div><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Pending Assessments</p><p className="text-3xl font-extrabold mt-1">{pending?.length || 0}</p></div></div>

      <div className="bg-white border rounded-xl overflow-hidden"><div className="p-5 border-b flex items-center gap-2"><Users className="h-5 w-5"/><h2 className="font-bold">My Students</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left p-3">Student</th><th className="text-left p-3">Today</th><th className="text-left p-3">Term Attendance</th><th className="text-left p-3">Latest Result</th></tr></thead><tbody>{students.map((s: any) => { const a=attendanceByStudent[s.id]; const g=latest[s.id]; const pct=a?.total?Math.round((a.present/a.total)*100):null; const gp=g?.assessments?.max_score>0?Math.round((g.score/g.assessments.max_score)*100):null; return <tr key={s.id} className="border-t"><td className="p-3"><div className="font-semibold">{s.full_name}</div><div className="text-xs text-slate-500">{s.admission_number}</div></td><td className="p-3">{attendanceMap[s.id] || "Not marked"}</td><td className="p-3">{pct == null ? "No records" : `${pct}%`}</td><td className="p-3">{g ? `${gp}% · ${g.assessments.title}` : "No published result"}</td></tr>})}{!students.length && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No active students in this class.</td></tr>}</tbody></table></div></div>
    </div>
  );
}
