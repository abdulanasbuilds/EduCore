"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, FileText, Download, History } from "lucide-react";
import Link from "next/link";

export default function ParentReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
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
        
      setStudent(studentData);
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
          <h1 className="text-2xl font-bold text-slate-800">Academic Reports</h1>
          <p className="text-sm text-slate-500">{student?.full_name} • {student?.admission_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                <FileText className="h-8 w-8" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Term Report Card</h3>
                <p className="text-sm text-slate-500 max-w-xs">Download the comprehensive end-of-term academic report.</p>
            </div>
            <button className="w-full bg-primary-800 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all active:scale-95 shadow-sm">
                <Download className="h-4 w-4" /> Download Latest Report
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <History className="h-8 w-8" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Academic Transcript</h3>
                <p className="text-sm text-slate-500 max-w-xs">Download a full history of all results across all years.</p>
            </div>
            <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-sm">
                <Download className="h-4 w-4" /> Download Transcript
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800">Historical Archives</h3>
        </div>
        <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="h-10 w-10 mx-auto opacity-20" />
            <p className="italic text-sm">Archived reports from previous academic years will appear here once the first year is concluded.</p>
        </div>
      </div>
    </div>
  );
}
