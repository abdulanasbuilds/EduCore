"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { AttendanceCalendar } from "@/components/shared/attendance-calendar";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Attendance } from "@/types";

export default function ParentAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [student, setStudent] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      
      const { data: studentData } = await supabase
        .from("students")
        .select("full_name, admission_number")
        .eq("id", id)
        .single();
        
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", id)
        .order("date", { ascending: false });
        
      setStudent(studentData);
      setAttendance(data || []);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/parent" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Record</h1>
          <p className="text-sm text-slate-500">{student?.full_name} • {student?.admission_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AttendanceCalendar attendance={attendance} />
        </div>

        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Term Summary</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Total School Days</span>
                        <span className="text-lg font-bold text-slate-800">{attendance.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Days Present</span>
                        <span className="text-lg font-bold text-green-600">{attendance.filter(a => a.status === 'Present').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Days Absent</span>
                        <span className="text-lg font-bold text-red-600">{attendance.filter(a => a.status === 'Absent').length}</span>
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-700">Attendance Rate</span>
                            <span className="text-xl font-black text-primary-600">
                                {attendance.length > 0 
                                    ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-primary-600 h-full transition-all duration-1000" 
                                style={{ width: `${attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100) : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Recent Absences</h3>
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                    {attendance.filter(a => a.status === 'Absent').length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-400 italic">No recorded absences.</p>
                    ) : (
                        attendance.filter(a => a.status === 'Absent').slice(0, 5).map(a => (
                            <div key={a.id} className="p-4 text-sm">
                                <p className="font-bold text-slate-800">{format(new Date(a.date), "MMMM d, yyyy")}</p>
                                <p className="text-xs text-slate-500 mt-1">{a.remarks || "No reason provided"}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
