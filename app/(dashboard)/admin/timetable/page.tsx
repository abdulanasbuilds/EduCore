"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X } from "lucide-react";

type Entry = { id: string; day_of_week: number; period_number: number; subject_id: string; teacher_id: string; subjects: { name: string }; profiles?: { full_name: string }; time_slots?: { start_time: string; end_time: string; period_number: number } };
type Slot = { id: string; start_time: string; end_time: string; period_number: number };

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<{ day: number; period: number; subjectId: string; teacherId: string } | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createClient() as any;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) { setLoading(false); return; }

      const [{ data: cls }, { data: yrs }, { data: sub }, { data: tch }] = await Promise.all([
        supabase.from("classes").select("id, name, level").eq("school_id", profile.school_id).order("level"),
        supabase.from("academic_years").select("id, name").eq("school_id", profile.school_id).order("start_date", { ascending: false }),
        supabase.from("subjects").select("id, name, code").eq("school_id", profile.school_id).order("name"),
        supabase.from("profiles").select("id, full_name").eq("school_id", profile.school_id).in("role", ["class_teacher", "subject_teacher"]).order("full_name"),
      ]);

      setClasses(cls || []);
      setSubjects(sub || []);
      setTeachers(tch || []);

      const currentYear = yrs?.find((y: any) => y.id === yrs[0]?.id);
      if (currentYear) {
        setSelectedYear(currentYear.id);
        if (cls?.length) setSelectedClass(cls[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadTimetable() {
      if (!selectedClass || !selectedYear) { setSlots([]); setEntries([]); return; }

      const { data: slotData } = await supabase
        .from("time_slots").select("*").order("period_number");

      const { data: entryData } = await supabase
        .from("timetables")
        .select("id, day_of_week, period_number, subject_id, teacher_id, subjects(name), profiles(full_name)")
        .eq("class_id", selectedClass)
        .eq("academic_year_id", selectedYear)
        .order("day_of_week");

      setSlots(slotData || []);
      setEntries(entryData || []);
    }
    loadTimetable();
  }, [selectedClass, selectedYear]);

  const getEntry = (day: number, periodNum: number) =>
    entries.find(e => e.day_of_week === day && e.period_number === periodNum);

  const openEdit = (day: number, periodNum: number, existing?: Entry) => {
    setEditEntry({ day, period: periodNum, subjectId: existing?.subject_id || "", teacherId: existing?.teacher_id || "" });
    setModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEntry) return;
    setSaving(true);

    if (editEntry.subjectId) {
      const { error } = await supabase.from("timetables").upsert({
        class_id: selectedClass,
        academic_year_id: selectedYear,
        subject_id: editEntry.subjectId,
        teacher_id: editEntry.teacherId || null,
        day_of_week: editEntry.day,
        period_number: editEntry.period,
      } as any, { onConflict: "class_id,academic_year_id,day_of_week,period_number" });

      if (error) { setMsg({ success: false, message: error.message }); }
      else {
        setMsg({ success: true, message: "Schedule saved" });
        const { data: entryData } = await supabase
          .from("timetables")
          .select("id, day_of_week, period_number, subject_id, teacher_id, subjects(name), profiles(full_name)")
          .eq("class_id", selectedClass).eq("academic_year_id", selectedYear).order("day_of_week");
        setEntries(entryData || []);
        setModalOpen(false);
      }
    } else {
      const existing = getEntry(editEntry.day, editEntry.period);
      if (existing) {
        await supabase.from("timetables").delete().eq("id", existing.id);
        const { data: entryData } = await supabase
          .from("timetables")
          .select("id, day_of_week, period_number, subject_id, teacher_id, subjects(name), profiles(full_name)")
          .eq("class_id", selectedClass).eq("academic_year_id", selectedYear).order("day_of_week");
        setEntries(entryData || []);
      }
      setModalOpen(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable Management</h1>
          <p className="text-sm text-slate-500">Click any cell to assign a subject to a period</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border px-3 py-2 rounded-lg text-sm bg-white">
          <option value="">Select Year...</option>
          {classes.length > 0 && <option value={selectedYear || ""}>{selectedYear || "..."}</option>}
        </select>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border px-3 py-2 rounded-lg text-sm bg-white">
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedClass && slots.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left text-sm font-medium text-slate-600 w-28">Time</th>
                  {days.map(d => <th key={d} className="border border-slate-200 p-3 text-center text-sm font-medium text-slate-600">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td className="border border-slate-200 p-2 font-medium text-sm text-slate-600 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500">P{slot.period_number}</div>
                      <div>{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</div>
                    </td>
                    {days.map((d, idx) => {
                      const dayNum = idx + 1;
                      const entry = getEntry(dayNum, slot.period_number);
                      return (
                        <td
                          key={d}
                          onClick={() => openEdit(dayNum, slot.period_number, entry)}
                          className={`border border-slate-200 p-2 text-center text-sm cursor-pointer hover:bg-indigo-50 transition-colors min-h-[60px] ${entry ? "bg-white" : "bg-slate-50"}`}
                        >
                          {entry ? (
                            <div>
                              <div className="font-medium text-slate-800 text-xs">{entry.subjects?.name}</div>
                              {entry.profiles?.full_name && <div className="text-xs text-slate-400">{entry.profiles.full_name}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-lg">+</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="bg-white p-8 rounded-xl border text-center text-slate-500">
          No time slots configured. Add periods in Settings.
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border text-center text-slate-500">Select a class to view or manage its timetable.</div>
      )}

      {modalOpen && editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {days[editEntry.day - 1]} — Period {editEntry.period}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={editEntry.subjectId}
                  onChange={e => setEditEntry({ ...editEntry, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">— Clear slot —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher <span className="text-slate-400">(optional)</span></label>
                <select
                  value={editEntry.teacherId}
                  onChange={e => setEditEntry({ ...editEntry, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">No teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}