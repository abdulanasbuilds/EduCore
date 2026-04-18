"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitAttendanceAction } from "@/actions/attendance-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { format } from "date-fns";
import type { AttendanceStatus } from "@/types";

export default function AttendanceMarkingPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string; adm: string }[]>([]);
  const [classInfo, setClassInfo] = useState<{ id: string; name: string; school_id: string } | null>(null);
  const [termInfo, setTermInfo] = useState<{ id: string } | null>(null);
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingMode, setExistingMode] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get teacher's class
        const { data: assignedClass } = await supabase
          .from("classes")
          .select("id, name, school_id")
          .eq("class_teacher_id", user.id)
          .single() as any;

        if (!assignedClass) {
          setLoading(false);
          return;
        }

        setClassInfo(assignedClass);

        // Get current term
        const { data: currentTerm } = await supabase
          .from("terms")
          .select("id")
          .eq("school_id", assignedClass.school_id)
          .eq("status", "active")
          .single() as any;

        if (currentTerm) setTermInfo(currentTerm);

        // Check if attendance already marked today
        const { data: existing } = await supabase
          .from("attendance")
          .select("student_id, status, remarks")
          .eq("class_id", assignedClass.id)
          .eq("date", today) as any;

        if (existing && existing.length > 0) {
          setExistingMode(true);
          const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
          existing.forEach((r: any) => {
            initialMap[r.student_id] = { status: r.status, remarks: r.remarks || "" };
          });
          setAttendance(initialMap);
        }

        // Get students in this class
        const { data: studentList } = await supabase
          .from("student_class_history")
          .select("student_id, students(full_name, admission_number)")
          .eq("class_id", assignedClass.id)
          .eq("is_current", true) as any;

        if (studentList) {
          const formattedList = studentList.map((s: any) => ({
            id: s.student_id,
            name: s.students?.full_name,
            adm: s.students?.admission_number,
          })).sort((a: any, b: any) => a.name.localeCompare(b.name));
          
          setStudents(formattedList);
          
          // If not existing, initialize all to Present
          if (!existing || existing.length === 0) {
            const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
            formattedList.forEach((s: any) => {
              initialMap[s.id] = { status: "Present", remarks: "" };
            });
            setAttendance(initialMap);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, today]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (existingMode) return;
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (existingMode) return;
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleSubmit = async () => {
    if (existingMode) return;
    if (!classInfo || !termInfo) {
      setError("Missing class or term information");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const records = Object.entries(attendance).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks
    }));

    const result = await submitAttendanceAction({
      classId: classInfo.id,
      termId: termInfo.id,
      date: today,
      records
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(result.message);
      setExistingMode(true);
    } else {
      setError(result.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading class data...</div>;
  }

  if (!classInfo) {
    return (
      <EmptyState
        icon="attendance"
        title="No Class Assigned"
        description="You are not assigned as a class teacher to any class. Only class teachers can mark daily attendance."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
          <p className="text-sm text-slate-500">{classInfo.name} • {format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-md">{success}</div>}

      {existingMode && !success && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex justify-between items-center">
          <span>Attendance has already been submitted for today.</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Student</th>
                <th className="px-4 py-3 font-medium text-slate-500 w-64">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500 w-64">Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.adm}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex rounded-md overflow-hidden border">
                      {(["Present", "Absent", "Late"] as const).map(status => (
                        <button
                          key={status}
                          disabled={existingMode}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                            attendance[student.id]?.status === status
                              ? status === "Present" ? "bg-green-600 text-white" :
                                status === "Absent" ? "bg-red-600 text-white" :
                                "bg-amber-500 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      disabled={existingMode}
                      value={attendance[student.id]?.remarks || ""}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      placeholder="Reason for absence..."
                      className="w-full text-xs px-2 py-1.5 border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!existingMode && (
          <div className="p-4 border-t bg-slate-50 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="bg-primary-800 text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
