"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function BehaviourPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterType, setFilterType] = useState("");
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;

      const [{ data: profileData }, { data: cls }, { data: lg }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("school_id", profile.school_id).in("role", ["class_teacher", "subject_teacher"]),
        supabase.from("classes").select("id, name").eq("school_id", profile.school_id).order("name"),
        supabase.from("behavior_logs")
          .select(`*, students(full_name, id), profiles!behavior_logs_logged_by_fkey(full_name), behavior_categories(name, type)`)
          .order("date", { ascending: false })
          .limit(100),
      ]);

      setClasses(cls || []);
      setLogs(lg || []);
      setLoading(false);
    }
    load();
  }, []);

  let filtered = logs;
  if (filterType) filtered = filtered.filter((l: any) => l.type === filterType);

  const total = logs.length;
  const positive = logs.filter((l: any) => l.type === "positive").length;
  const negative = logs.filter((l: any) => l.type === "negative").length;
  const flagged = 0;

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Behaviour & Disciplinary Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-slate-500">Total Incidents (Term)</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-slate-500">Positive vs Negative</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-green-600">{positive} Positive</span>
            <span className="text-slate-400">/</span>
            <span className="text-lg font-bold text-red-600">{negative} Negative</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm font-medium text-red-800">Students Flagged (3+ Negative)</p>
          <p className="text-2xl font-bold text-red-900">{flagged} Students</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-slate-50">
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="border p-2 rounded w-48">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border p-2 rounded w-48">
            <option value="">All Types</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="grades" title="No behaviour records" description="Behaviour logs will appear here when teachers log incidents." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-white">
                <th className="p-4 font-medium text-slate-600">Date</th>
                <th className="p-4 font-medium text-slate-600">Student</th>
                <th className="p-4 font-medium text-slate-600">Type</th>
                <th className="p-4 font-medium text-slate-600">Category</th>
                <th className="p-4 font-medium text-slate-600">Logged By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l: any) => (
                <tr key={l.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 text-sm">{format(new Date(l.date), "MMM d, yyyy")}</td>
                  <td className="p-4 font-medium">{l.students?.full_name || "Unknown"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${l.type === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{l.behavior_categories?.name || l.description}</td>
                  <td className="p-4 text-slate-500 text-sm">{l.profiles?.full_name || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
