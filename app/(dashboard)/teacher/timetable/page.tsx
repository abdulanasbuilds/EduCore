"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TeacherTimetablePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient() as any;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const [{ data: entryData }, { data: slotData }] = await Promise.all([
        supabase
          .from("timetables")
          .select("*, classes(name), subjects(name), profiles(full_name), time_slots(start_time, end_time, period_number)")
          .eq("teacher_id", user.id)
          .order("day_of_week"),
        supabase.from("time_slots").select("*").order("period_number"),
      ]);

      setEntries(entryData || []);
      setSlots(slotData || []);
      setLoading(false);
    }
    load();
  }, []);

  const getEntry = (day: number, periodNum: number) =>
    entries.find(e => e.day_of_week === day && e.time_slots?.period_number === periodNum);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Timetable</h1>

      {entries.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-slate-500">
          No timetable assigned yet. Contact the school admin.
        </div>
      ) : (
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
                      <div className="text-xs font-bold text-slate-400">P{slot.period_number}</div>
                      <div>{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</div>
                    </td>
                    {days.map((d, idx) => {
                      const entry = getEntry(idx + 1, slot.period_number);
                      return (
                        <td key={d} className="border border-slate-200 p-2 text-center min-h-[60px] bg-white">
                          {entry ? (
                            <div>
                              <div className="font-medium text-slate-800 text-xs">{entry.subjects?.name}</div>
                              <div className="text-xs text-slate-400">{entry.classes?.name}</div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
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