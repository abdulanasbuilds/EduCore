import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, Download, Filter } from "lucide-react";
import Link from "next/link";

export default async function AdminAttendanceReportsPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id, name")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const { data: students } = await supabase
    .from("student_class_history")
    .select("student_id, classes(name), students(full_name, admission_number)")
    .eq("academic_year_id", (await supabase.from("academic_years").select("id").eq("school_id", profile?.school_id).eq("is_current", true).single()).data?.id)
    .eq("is_current", true);

  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("term_id", activeTerm?.id || "");

  const reportData = students?.map((s: any) => {
    const studentRecords = attendanceStats?.filter((a: any) => a.student_id === s.student_id) || [];
    const total = studentRecords.length;
    const present = studentRecords.filter((a: any) => a.status === "Present").length;
    const absent = studentRecords.filter((a: any) => a.status === "Absent").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return {
      student_id: s.student_id,
      name: s.students.full_name,
      adm: s.students.admission_number,
      className: s.classes.name,
      total,
      present,
      absent,
      percentage
    };
  }).sort((a: any, b: any) => a.percentage - b.percentage); // Sort ascending by default to show defaulters

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/attendance" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Overview
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Reports</h1>
          <p className="text-sm text-slate-500">{activeTerm?.name || "Active Term"} Analytics</p>
        </div>
        <button className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select className="pl-10 pr-4 py-2 border rounded-md text-sm w-full min-h-[44px] appearance-none bg-white">
            <option value="">Filter by Class</option>
          </select>
        </div>
      </div>

      {!reportData || reportData.length === 0 ? (
        <EmptyState 
          icon="attendance"
          title="No data available"
          description="Attendance data for the current term is not available yet."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-center">Total Days</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                  <th className="px-6 py-4 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reportData.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.adm}</p>
                    </td>
                    <td className="px-6 py-4">{s.className}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{s.total}</td>
                    <td className="px-6 py-4 text-center font-medium text-green-600">{s.present}</td>
                    <td className="px-6 py-4 text-center font-medium text-red-600">{s.absent}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      <span className={`px-2 py-1 rounded-md ${
                        s.percentage < 75 ? "bg-red-100 text-red-800" : "text-slate-800"
                      }`}>
                        {s.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
