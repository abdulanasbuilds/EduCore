"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { StudentListActions } from "@/components/admin/student-list-actions";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function StudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;
      const [{ data: cls }, { data: st }] = await Promise.all([
        supabase.from("classes").select("id, name").eq("school_id", profile.school_id).order("name"),
        supabase
          .from("students")
          .select("id, admission_number, full_name, status, enrollment_date, gender, student_class_history(class_id, classes(name), is_current)")
          .eq("school_id", profile.school_id)
          .eq("student_class_history.is_current", true)
          .order("full_name"),
      ]);
      setClasses(cls || []);
      setStudents(st || []);
      setLoading(false);
    }
    load();
  }, []);

  let filtered = students;
  if (search) filtered = filtered.filter((s: any) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <StudentListActions classes={classes} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name or admission number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border rounded-md text-sm min-h-[44px]">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {!students || students.length === 0 ? (
          <EmptyState icon="students" title="No students found" description="You haven't enrolled any students yet." actionLabel="Add Student" actionHref="/admin/students/new" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="students" title="No results" description="No students match your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">Admission No.</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student: any) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{student.admission_number}</td>
                    <td className="px-6 py-4">{student.full_name}</td>
                    <td className="px-6 py-4">{student.student_class_history?.[0]?.classes?.name || "Unassigned"}</td>
                    <td className="px-6 py-4">{student.gender}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${student.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/students/${student.id}`} className="text-primary-600 hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
