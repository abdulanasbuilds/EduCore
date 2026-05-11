export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/stat-card";
import { Users, BookOpen, CalendarCheck, MessageSquare } from "lucide-react";

export default async function TeacherDashboardPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, full_name")
    .eq("id", user?.id)
    .single();

  const { data: myClass } = await supabase
    .from("classes")
    .select("id, name")
    .eq("class_teacher_id", user?.id)
    .limit(1)
    .single();

  const { count: pendingAttendance } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("date", new Date().toISOString().split("T")[0]);

  const { count: ungradedCount } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("is_published", false);

  const { data: upcomingEvents } = await supabase
    .from("school_events")
    .select("id, title, event_date")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date")
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile?.full_name?.split(" ")[0] || "Teacher"}
        </h1>
        {myClass ? (
          <p className="text-sm text-slate-500">Class Teacher — {myClass.name}</p>
        ) : (
          <p className="text-sm text-slate-500">Subject Teacher</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Classes" value={myClass ? "1" : "—"} icon={<BookOpen className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Attendance Today" value={pendingAttendance ? "Pending" : "Done"} icon={<CalendarCheck className="h-5 w-5 text-emerald-600" />} />
        <StatCard title="Upcoming Events" value={upcomingEvents?.length || 0} icon={<CalendarCheck className="h-5 w-5 text-purple-600" />} />
        <StatCard title="Ungraded Assignments" value={ungradedCount || 0} icon={<BookOpen className="h-5 w-5 text-amber-600" />} />
      </div>

      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-4 text-slate-800">Upcoming Events</h3>
          <ul className="space-y-3">
            {upcomingEvents.map((e: any) => (
              <li key={e.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                <span className="font-medium text-slate-700">{e.title}</span>
                <span className="text-slate-500 text-xs">{new Date(e.event_date).toLocaleDateString("en-GB")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
