import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = date || today;

  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, level, capacity")
    .eq("school_id", profile?.school_id)
    .order("level");

  const { data: attendance } = await supabase
    .from("attendance")
    .select("class_id, status")
    .eq("date", selectedDate)
    .in("class_id", classes?.map((c: any) => c.id) || []);

  const classStats = classes?.map((c: any) => {
    const classAttendance = attendance?.filter((a: any) => a.class_id === c.id) || [];
    const total = classAttendance.length;
    const present = classAttendance.filter((a: any) => a.status === "Present").length;
    const absent = classAttendance.filter((a: any) => a.status === "Absent").length;
    const late = classAttendance.filter((a: any) => a.status === "Late").length;
    
    return {
      ...c,
      submitted: total > 0,
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Overview</h1>
          <p className="text-sm text-slate-500">View daily attendance across all classes</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/attendance/reports" className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 min-h-[44px] flex items-center">
            Detailed Reports
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Date</label>
            <input 
              type="date" 
              name="date"
              defaultValue={selectedDate}
              className="px-3 py-2 border rounded-md text-sm min-h-[44px] w-full"
            />
          </div>
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 min-h-[44px] w-full sm:w-auto">
            View Date
          </button>
        </form>
      </div>

      {!classes || classes.length === 0 ? (
        <EmptyState 
          icon="attendance"
          title="No classes configured"
          description="You need to set up classes before tracking attendance."
          actionLabel="Setup Classes"
          actionHref="/admin/classes"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-semibold text-slate-800">
              Attendance for {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                  <th className="px-6 py-4 text-center">Late</th>
                  <th className="px-6 py-4 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {classStats?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.submitted ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {c.submitted ? "Submitted" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{c.submitted ? c.present : "-"}</td>
                    <td className="px-6 py-4 text-center font-medium text-red-600">{c.submitted ? c.absent : "-"}</td>
                    <td className="px-6 py-4 text-center text-amber-600">{c.submitted ? c.late : "-"}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {c.submitted ? `${c.percentage}%` : "-"}
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
