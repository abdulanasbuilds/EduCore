import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { withdrawStudentAction } from "@/actions/student-actions";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = (await createClient()) as any;

  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      student_class_history(
        id, is_current, enrolled_date, outcome,
        classes(name)
      ),
      student_guardians(
        guardians(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!student) {
    notFound();
  }

  const currentHistory = student.student_class_history.find((h: { is_current: boolean; classes: { name: string } | null }) => h.is_current);
  const guardians = student.student_guardians.map((sg: { guardians: Record<string, unknown> }) => sg.guardians);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
          <p className="text-sm text-slate-500">
            {student.admission_number} • {currentHistory?.classes?.name || "Unassigned"} • {student.status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-slate-500">Date of Birth</p>
                <p className="font-medium">{format(new Date(student.date_of_birth), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-slate-500">Gender</p>
                <p className="font-medium">{student.gender}</p>
              </div>
              <div>
                <p className="text-slate-500">Enrollment Date</p>
                <p className="font-medium">{format(new Date(student.enrollment_date), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium">{student.status}</p>
              </div>
            </div>
          </div>

          {/* Academic History */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 border-b pb-2">Class History</h3>
            <div className="space-y-4">
              {student.student_class_history.map((history: { id: string; classes: { name: string } | null; enrolled_date: string; is_current: boolean; outcome: string }) => (
                <div key={history.id} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800">{history.classes?.name}</p>
                    <p className="text-xs text-slate-500">Enrolled: {format(new Date(history.enrolled_date), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    history.is_current ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {history.is_current ? "Current" : history.outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Guardians */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 border-b pb-2">Guardians</h3>
            <div className="space-y-4">
              {guardians.map((guardian: { id: string; full_name: string; relationship: string; phone: string }) => (
                <div key={guardian.id} className="text-sm">
                  <p className="font-medium text-slate-800">{guardian.full_name}</p>
                  <p className="text-slate-500 text-xs">{guardian.relationship}</p>
                  <p className="mt-1">{guardian.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 border-b pb-2">Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 rounded text-sm font-medium hover:bg-slate-50 text-slate-700">
                Download Latest Report Card
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-sm font-medium hover:bg-slate-50 text-slate-700">
                View Fee Statement
              </button>
              
              {student.status === "Active" && (
                <div className="pt-4 border-t mt-4">
                  <ConfirmDialog 
                    title="Withdraw Student"
                    description={`Are you sure you want to withdraw ${student.full_name}? This will lock their records.`}
                    variant="destructive"
                    confirmLabel="Withdraw Student"
                    onConfirm={async () => {
                      "use server";
                      await withdrawStudentAction(student.id, "Withdrawn by admin", new Date().toISOString());
                    }}
                    trigger={
                      <button className="w-full text-left px-3 py-2 rounded text-sm font-medium hover:bg-red-50 text-red-600">
                        Withdraw Student
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
