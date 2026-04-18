import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";

export default async function StudentsPage() {
  const supabase = (await createClient()) as any;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user?.id || "")
    .single() as any;

  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      full_name,
      status,
      enrollment_date,
      gender,
      student_class_history!inner(class_id, classes(name), is_current)
    `)
    .eq("school_id", profile?.school_id || "")
    .eq("student_class_history.is_current", true)
    .order("full_name");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 min-h-[44px]">
            Import CSV
          </button>
          <Link
            href="/admin/students/new"
            className="px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center min-h-[44px]"
          >
            Add Student
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search students..." 
            className="px-3 py-2 border rounded-md text-sm w-full sm:w-64 min-h-[44px]"
          />
          <select className="px-3 py-2 border rounded-md text-sm min-h-[44px] w-full sm:w-auto">
            <option value="">All Classes</option>
            {/* Real implementation would map active classes here */}
          </select>
        </div>

        {!students || students.length === 0 ? (
          <EmptyState 
            icon="students"
            title="No students found"
            description="You haven't enrolled any students yet. Add a student manually or import from a CSV."
            actionLabel="Add Student"
            actionHref="/admin/students/new"
          />
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
                {students.map((student: {
                  id: string;
                  admission_number: string;
                  full_name: string;
                  status: string;
                  gender: string;
                  student_class_history: { classes: { name: string } }[];
                }) => {
                  const currentClass = student.student_class_history[0]?.classes?.name || "Unassigned";
                  
                  return (
                    <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{student.admission_number}</td>
                      <td className="px-6 py-4">{student.full_name}</td>
                      <td className="px-6 py-4">{currentClass}</td>
                      <td className="px-6 py-4">{student.gender}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/students/${student.id}`}
                          className="text-primary-600 hover:underline font-medium px-2 py-1"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
