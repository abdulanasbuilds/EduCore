import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubjectTeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles")
    .select("id, school_id, full_name, is_active")
    .eq("id", user.id).single();
  if (!profile?.school_id || !profile.is_active) redirect("/login");

  const { data: term } = await supabase.from("terms")
    .select("id, name, academic_year_id")
    .eq("school_id", profile.school_id).eq("status", "active").single();

  const { data: assignments } = await supabase.from("class_subjects")
    .select("class_id, subject_id, classes(id, name), subjects(id, name)")
    .eq("teacher_id", profile.id)
    .eq("academic_year_id", term?.academic_year_id || "");

  if (!assignments?.length) return <div className="p-6 text-center text-amber-700 bg-amber-50 rounded-lg">You are not assigned to teach any subjects in the current academic year.</div>;

  const classIds = [...new Set(assignments.map((a: any) => a.class_id))];
  const subjectIds = [...new Set(assignments.map((a: any) => a.subject_id))];
  const empty = "00000000-0000-0000-0000-000000000000";

  const { data: history } = await supabase.from("student_class_history")
    .select("student_id, class_id, students(id, full_name, status)")
    .in("class_id", classIds.length ? classIds : [empty])
    .eq("academic_year_id", term?.academic_year_id || "")
    .eq("is_current", true);
  const activeStudents = (history || []).filter((h: any) => h.students?.status === "Active");
  const studentIds = activeStudents.map((h: any) => h.student_id);

  const { data: assessments } = await supabase.from("assessments")
    .select("id, class_id, subject_id, title, date, max_score, is_published, subjects(name)")
    .in("class_id", classIds.length ? classIds : [empty])
    .in("subject_id", subjectIds.length ? subjectIds : [empty])
    .eq("term_id", term?.id || "");

  const mine = (assessments || []).filter((a: any) => assignments.some((x: any) => x.class_id === a.class_id && x.subject_id === a.subject_id));
  const assessmentIds = mine.map((a: any) => a.id);
  const { data: grades } = await supabase.from("grades")
    .select("assessment_id, student_id, score")
    .in("assessment_id", assessmentIds.length ? assessmentIds : [empty]);

  const rows = assignments.map((a: any) => {
    const relevant = mine.filter((x: any) => x.class_id === a.class_id && x.subject_id === a.subject_id);
    const relevantIds = new Set(relevant.map((x: any) => x.id));
    const relevantGrades = (grades || []).filter((g: any) => relevantIds.has(g.assessment_id) && g.score !== null);
    const percentages = relevantGrades
      .map((g: any) => { const ass = relevant.find((x: any) => x.id === g.assessment_id); return ass?.max_score > 0 ? (g.score / ass.max_score) * 100 : null; })
      .filter((v: any) => v !== null);
    const average = percentages.length ? Math.round((percentages.reduce((s: number, v: number) => s + v, 0) / percentages.length) * 10) / 10 : null;
    const pending = relevant.filter((x: any) => !x.is_published).length;
    return { classId: a.class_id, subjectId: a.subject_id, className: a.classes?.name || "Unknown", subjectName: a.subjects?.name || "Unknown", students: activeStudents.filter((h: any) => h.class_id === a.class_id).length, assessments: relevant.length, pending, average };
  });

  return <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
    <div><h1 className="text-2xl font-bold text-slate-800">Welcome, {profile.full_name.split(" ")[0]}</h1><p className="text-sm text-slate-500">Subject Teacher · {term?.name || "No Active Term"} · {format(new Date(), "dd MMM yyyy")}</p></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Classes</p><p className="text-3xl font-extrabold mt-1">{classIds.length}</p></div><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Students Taught</p><p className="text-3xl font-extrabold mt-1">{activeStudents.length}</p></div><div className="bg-white border rounded-xl p-5"><p className="text-xs font-bold text-slate-500 uppercase">Pending Assessments</p><p className="text-3xl font-extrabold mt-1">{mine.filter((a: any) => !a.is_published).length}</p></div></div>
    <div className="bg-white border rounded-xl overflow-hidden"><div className="p-5 border-b"><h2 className="font-bold">My Subjects & Classes</h2><p className="text-sm text-slate-500 mt-1">Averages are calculated from saved grades; no placeholder chart values are used.</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Class</th><th className="p-3 text-left">Subject</th><th className="p-3 text-left">Students</th><th className="p-3 text-left">Assessments</th><th className="p-3 text-left">Average</th><th className="p-3 text-left">Action</th></tr></thead><tbody>{rows.map((r: any, i: number) => <tr key={`${r.classId}-${r.subjectId}-${i}`} className="border-t"><td className="p-3 font-semibold">{r.className}</td><td className="p-3">{r.subjectName}</td><td className="p-3">{r.students}</td><td className="p-3">{r.assessments}{r.pending ? <span className="ml-2 text-amber-700">({r.pending} pending)</span> : ""}</td><td className="p-3">{r.average == null ? "No graded work" : `${r.average}%`}</td><td className="p-3"><Link href="/teacher/grades" className="font-semibold text-primary-700 hover:underline">Enter grades</Link></td></tr>)}{!rows.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No teaching assignments found.</td></tr>}</tbody></table></div></div>
  </div>;
}
