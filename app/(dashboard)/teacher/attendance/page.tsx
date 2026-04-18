import { createClient } from "@/lib/supabase/server";

export default async function AttendancePage() {
  const supabase = await createClient();

  // Stub fetching assigned class
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
          <p className="text-sm text-slate-500">Primary 4 • {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-slate-500">
        Attendance module implementation in progress.
      </div>
    </div>
  );
}