import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";

interface StudentData {
  id: string;
  admission_number: string;
  full_name: string;
  status: string;
  enrollment_date: string;
  gender: string;
}

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      full_name,
      status,
      enrollment_date,
      gender
    `)
    .order("full_name");
    
  const students = data as StudentData[] | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50">
            Import CSV
          </button>
          <Link
            href="/admin/students/new"
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90"
          >
            Add Student
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <input 
            type="text" 
            placeholder="Search students..." 
            className="px-3 py-2 border rounded-md text-sm w-64"
          />
          <select className="px-3 py-2 border rounded-md text-sm">
            <option value="">All Classes</option>
            <option value="p1">Primary 1</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Admission No.</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Enrolled</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!students || students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{student.admission_number}</td>
                    <td className="px-6 py-4">{student.full_name}</td>
                    <td className="px-6 py-4">{student.gender}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {format(new Date(student.enrollment_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/students/${student.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}