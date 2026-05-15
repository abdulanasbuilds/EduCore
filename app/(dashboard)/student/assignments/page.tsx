"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

export default function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tab, setTab] = useState("pending");
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { data } = await supabase
        .from("assignments")
        .select("*, classes(name), subjects(name)")
        .order("due_date", { ascending: false });
      setAssignments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const now = new Date();
  const filtered = assignments.filter((a: any) => {
    if (tab === "pending") return new Date(a.due_date) >= now;
    if (tab === "submitted") return a.submitted;
    if (tab === "graded") return a.graded;
    return true;
  });

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  const overdue = assignments.filter((a: any) => new Date(a.due_date) < now);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-red-800 text-sm font-medium">You have {overdue.length} overdue assignment(s).</p>
        </div>
      )}

      <div className="flex gap-2 border-b mb-6">
        {["pending","submitted","graded","all"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium text-sm capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No {tab} assignments.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a: any) => {
            const isOverdue = new Date(a.due_date) < now;
            return (
              <div key={a.id} className={`bg-white rounded-lg shadow-sm border p-6 flex flex-col relative ${isOverdue ? "border-red-200" : ""}`}>
                {isOverdue && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">OVERDUE</div>}
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-slate-500">{a.subjects?.name}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{a.title}</h2>
                <p className="text-slate-600 mb-4 text-sm flex-grow">{a.description}</p>
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center justify-between mb-4 ${isOverdue ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                  <span>{isOverdue ? "Was due" : "Due"}</span>
                  <span>{format(new Date(a.due_date), "MMM d, yyyy")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
