"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

const STATUS_OPTIONS = ["present", "absent", "late", "on_leave"];

export default function StaffAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [staff, setStaff] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;

      const { data: staffList } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("school_id", profile.school_id)
        .in("role", ["class_teacher", "subject_teacher", "bursar", "school_admin"])
        .order("full_name");

      const { data: records } = await supabase
        .from("staff_attendance")
        .select("*")
        .eq("date", date);

      const recordMap: Record<string, any> = {};
      records?.forEach((r: any) => { recordMap[r.staff_id] = r; });

      setStaff(staffList || []);
      setAttendance(recordMap);
      setLoading(false);
    }
    load();
  }, [date]);

  const handleStatusChange = (staffId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], status, staff_id: staffId },
    }));
  };

  const handleTimeChange = (staffId: string, arrival_time: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], arrival_time },
    }));
  };

  const handleRemarksChange = (staffId: string, remarks: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], remarks },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const staffMember of staff) {
      const record = attendance[staffMember.id];
      if (!record?.status) continue;
      const exists = await supabase
        .from("staff_attendance")
        .select("id")
        .eq("staff_id", staffMember.id)
        .eq("date", date)
        .single();

      if (exists.data) {
        await supabase.from("staff_attendance").update({
          status: record.status, arrival_time: record.arrival_time || null, remarks: record.remarks || null,
        }).eq("id", exists.data.id);
      } else {
        await supabase.from("staff_attendance").insert({
          staff_id: staffMember.id, date, status: record.status,
          arrival_time: record.arrival_time || null, remarks: record.remarks || null,
        });
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Attendance</h1>
        <div className="flex gap-4">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-4 font-medium text-slate-600">Staff Name</th>
              <th className="p-4 font-medium text-slate-600">Role</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
              <th className="p-4 font-medium text-slate-600">Arrival Time</th>
              <th className="p-4 font-medium text-slate-600">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s: any) => {
              const record = attendance[s.id] || {};
              return (
                <tr key={s.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium">{s.full_name}</td>
                  <td className="p-4 text-slate-500 capitalize">{s.role.replace("_", " ")}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleStatusChange(s.id, opt)}
                          className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                            record.status === opt
                              ? opt === "present" ? "bg-green-600 text-white"
                              : opt === "absent" ? "bg-red-600 text-white"
                              : opt === "late" ? "bg-amber-500 text-white"
                              : "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {opt.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <input type="time" value={record.arrival_time || ""} onChange={(e) => handleTimeChange(s.id, e.target.value)} className="border p-1 rounded text-sm w-24" />
                  </td>
                  <td className="p-4">
                    <input type="text" value={record.remarks || ""} onChange={(e) => handleRemarksChange(s.id, e.target.value)} placeholder="Optional" className="border p-1 rounded text-sm w-full" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {staff.length > 0 && (
          <div className="p-4 border-t bg-slate-50 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
