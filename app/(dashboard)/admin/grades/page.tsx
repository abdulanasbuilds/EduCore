import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen, Search, Download } from "lucide-react";
import Link from "next/link";

export default async function AdminGradesPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id, name")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const { data: assessments } = await supabase
    .from("assessments")
    .select(`
      id,
      title,
      is_published,
      max_score,
      classes(name),
      subjects(name),
      assessment_types(name),
      grades(count)
    `)
    .eq("term_id", activeTerm?.id || "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Grades Overview</h1>
          <p className="text-sm text-slate-500">Monitor academic performance for {activeTerm?.name}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/admin/assessments" 
            className="px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 flex items-center min-h-[44px]"
          >
            Manage Assessments
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Published Assessments</p>
            <p className="text-2xl font-bold text-slate-800">
              {assessments?.filter((a: any) => a.is_published).length || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Search className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Draft Assessments</p>
            <p className="text-2xl font-bold text-slate-800">
              {assessments?.filter((a: any) => !a.is_published).length || 0}
            </p>
            <p className="text-xs text-amber-600 mt-1 font-medium">Require teacher action</p>
          </div>
        </div>
      </div>

      {!assessments || assessments.length === 0 ? (
        <EmptyState 
          icon="grades"
          title="No assessments found"
          description="Create assessments and assign them to teachers to start tracking grades."
          actionLabel="Go to Assessments"
          actionHref="/admin/assessments"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Recent Assessments</h3>
            <button className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4 text-center">Entries</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">Max Score: {a.max_score}</p>
                    </td>
                    <td className="px-6 py-4">{a.classes?.name}</td>
                    <td className="px-6 py-4">{a.subjects?.name}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{a.assessment_types?.name}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {a.grades[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {a.is_published ? "Published" : "Draft"}
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
