"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TeacherAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { data } = await supabase
        .from("assignments")
        .select("*, classes(name), subjects(name)")
        .eq("teacher_id", user.id)
        .order("due_date", { ascending: false });
      setAssignments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Assignments</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No assignments created yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 font-medium text-slate-600">Title</th>
                <th className="p-4 font-medium text-slate-600">Class</th>
                <th className="p-4 font-medium text-slate-600">Subject</th>
                <th className="p-4 font-medium text-slate-600">Due Date</th>
                <th className="p-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium">{a.title}</td>
                  <td className="p-4">{a.classes?.name}</td>
                  <td className="p-4">{a.subjects?.name}</td>
                  <td className="p-4">{new Date(a.due_date).toLocaleDateString("en-GB")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${a.is_published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {a.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
