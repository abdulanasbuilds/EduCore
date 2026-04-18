"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { BookOpen, Calendar, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ParentGradesPage({ params }: { params: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const { data: grades } = await supabase
        .from("grades")
        .select("*, assessments(*, subjects(*))")
        .eq("student_id", id);
      setData(grades);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Performance</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Assessment</th>
              <th className="px-6 py-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.map((g: any) => (
              <tr key={g.id}>
                <td className="px-6 py-4 font-medium">{g.assessments?.subjects?.name}</td>
                <td className="px-6 py-4">{g.assessments?.title}</td>
                <td className="px-6 py-4 text-right">{g.score} / {g.assessments?.max_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
