import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Filter } from "lucide-react";
import { AssessmentActions } from "@/components/admin/assessment-actions";

export default async function AdminAssessmentsPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase.from("terms").select("id, name").eq("school_id", profile?.school_id).eq("status", "active").single();

  const { data: assessments } = await supabase
    .from("assessments")
    .select(`
      *,
      classes(name),
      subjects(name),
      assessment_types(name, weight)
    `)
    .eq("term_id", activeTerm?.id || "")
    .order("date", { ascending: false });

  const { data: classes } = await supabase.from("classes").select("id, name").eq("school_id", profile?.school_id);
  const { data: subjects } = await supabase.from("subjects").select("id, name").eq("school_id", profile?.school_id);
  const { data: types } = await supabase.from("assessment_types").select("id, name").eq("school_id", profile?.school_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
        {activeTerm && (
            <AssessmentActions 
                classes={classes || []} 
                subjects={subjects || []} 
                types={types || []} 
                activeTermId={activeTerm.id} 
            />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select className="pl-10 pr-4 py-2 border rounded-md text-sm w-full min-h-[44px] appearance-none bg-white">
              <option value="">Filter by Class</option>
            </select>
          </div>
          <select className="px-3 py-2 border rounded-md text-sm min-h-[44px] sm:w-48">
            <option value="">Filter by Subject</option>
          </select>
        </div>

        {!assessments || assessments.length === 0 ? (
          <EmptyState 
            icon="grades"
            title="No assessments yet"
            description="Create your first assessment to start tracking student performance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Assessment Title</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{a.title}</td>
                    <td className="px-6 py-4">{a.classes?.name}</td>
                    <td className="px-6 py-4">{a.subjects?.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{a.assessment_types?.name}</span>
                      <span className="ml-1 text-xs text-slate-400">({a.assessment_types?.weight}%)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {a.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-600 hover:underline font-medium px-2 py-1 rounded">View Grades</button>
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
