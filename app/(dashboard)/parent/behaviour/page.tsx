"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function ParentBehaviourPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { data: guardian } = await supabase.from("guardians").select("student_id").eq("user_id", user.id).limit(1).single();
      if (!guardian) { setLoading(false); return; }
      const { data } = await supabase
        .from("behavior_logs")
        .select("*, behavior_categories(name)")
        .eq("student_id", guardian.student_id)
        .order("date", { ascending: false });
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Behaviour & Disciplinary Record</h1>

      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-slate-500">No behaviour records found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 font-medium text-slate-600">Date</th>
                <th className="p-4 font-medium text-slate-600">Type</th>
                <th className="p-4 font-medium text-slate-600">Category</th>
                <th className="p-4 font-medium text-slate-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id} className="border-b">
                  <td className="p-4">{format(new Date(l.date), "MMM d, yyyy")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${l.type === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{l.behavior_categories?.name || "—"}</td>
                  <td className="p-4 text-slate-600">{l.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
