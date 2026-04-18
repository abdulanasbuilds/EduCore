import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, ClipboardList, BookOpen, Receipt, Bell } from "lucide-react";
import Link from "next/link";

export default async function ParentPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get parent profile and linked children
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  const { data: linkedChildren } = await supabase
    .from("student_guardians")
    .select(`
      student_id,
      students (
        id,
        full_name,
        admission_number,
        status,
        student_class_history (
          is_current,
          classes (name)
        )
      )
    `)
    .eq("guardian_id", (await supabase.from("guardians").select("id").eq("user_id", user.id).single()).data?.id);

  const children = linkedChildren?.map((lc: any) => lc.students) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.full_name}</h1>
      </div>

      {children.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border shadow-sm">
          <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No children linked</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Please contact the school office to link your children to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child: any) => {
            const currentClass = child.student_class_history?.find((h: any) => h.is_current)?.classes?.name || "Unassigned";
            return (
              <div key={child.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-primary-800 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
                      {child.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{child.full_name}</h3>
                      <p className="text-xs text-white/70">{child.admission_number} • {currentClass}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 divide-x divide-y">
                  <Link href={`/parent/grades/${child.id}`} className="p-4 hover:bg-slate-50 flex flex-col items-center gap-2 text-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Latest Grades</span>
                  </Link>
                  <Link href={`/parent/attendance/${child.id}`} className="p-4 hover:bg-slate-50 flex flex-col items-center gap-2 text-center">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Attendance</span>
                  </Link>
                  <Link href={`/parent/fees/${child.id}`} className="p-4 hover:bg-slate-50 flex flex-col items-center gap-2 text-center">
                    <Receipt className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">Fee Balance</span>
                  </Link>
                  <div className="p-4 bg-slate-50/50 flex flex-col items-center gap-2 text-center">
                    <Bell className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-400 font-italic">Reports Coming Soon</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 text-lg mb-4">Latest Announcements</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-md">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">General Announcement • April 15, 2024</p>
            <h4 className="font-semibold text-slate-800 mb-1">End of Term Examinations</h4>
            <p className="text-sm text-slate-600">The end of term examinations will commence on Monday, May 12th. Please ensure all fees are cleared before this date.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
