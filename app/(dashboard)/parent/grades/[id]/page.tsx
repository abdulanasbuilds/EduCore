"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ParentGradesPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
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
        
      const { data: grades } = await supabase
        .from("grades")
        .select("*, assessments(*, subjects(*), assessment_types(*))")
        .eq("student_id", id)
        .order("created_at", { ascending: false });
        
      setStudent(studentData);
      setData(grades || []);
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
          <h1 className="text-2xl font-bold text-slate-800">Academic Performance</h1>
          <p className="text-sm text-slate-500">{student?.full_name} • {student?.admission_number}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Assessment Results</h3>
            <span className="text-xs bg-white px-2 py-1 rounded border font-medium text-slate-500">Current Term</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Score</th>
                  <th className="px-6 py-4 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No grades published for this term yet.</td>
                    </tr>
                ) : data.map((g: any) => {
                  const score = g.score || 0;
                  const max = g.assessments?.max_score || 100;
                  const percent = Math.round((score / max) * 100);
                  
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">{g.assessments?.subjects?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{g.assessments?.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 uppercase font-medium">{g.assessments?.assessment_types?.name}</td>
                      <td className="px-6 py-4 text-right font-medium">
                        <span className="text-slate-900">{score}</span>
                        <span className="text-slate-400 ml-1">/ {max}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${percent >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
