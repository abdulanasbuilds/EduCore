"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { ArrowLeft, Download, Loader2, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import { generateReportCardAction } from "@/actions/report-actions";

export default function ParentGradesPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [downloading, setDownloading] = useState(false);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { id } = await params;
      
      const { data: studentData } = await supabase
        .from("students").select("full_name, admission_number").eq("id", id).single();

      const { data: yrs } = await supabase
        .from("academic_years").select("id, name, terms(id, name, term_number)")
        .order("start_date", { ascending: false }).limit(1).single();

      if (yrs?.terms?.length) {
        const sorted = [...yrs.terms].sort((a: any, b: any) => a.term_number - b.term_number);
        setTerms(sorted);
        setSelectedTermId(sorted[sorted.length - 1]?.id || "");
      }

      setStudent(studentData);
      setLoading(false);
    }
    load();
  }, [params, supabase]);

  useEffect(() => {
    async function loadGrades() {
      if (!selectedTermId) return;
      const { id } = await params;
      
      const { data: grades } = await supabase
        .from("grades")
        .select("*, assessments(*, subjects(*), assessment_types(*))")
        .eq("student_id", id)
        .eq("assessments.term_id", selectedTermId)
        .eq("assessments.is_published", true)
        .order("created_at", { ascending: false });
      
      setData(grades || []);
    }
    loadGrades();
  }, [selectedTermId, params, supabase]);

  const handleDownload = async () => {
    if (!selectedTermId) return;
    const { id } = await params;
    setDownloading(true);
    const result = await generateReportCardAction(id, selectedTermId);
    if (result.success && result.buffer) {
      const blob = new Blob([result.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-card-${student?.admission_number || "unknown"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(false);
  };

  if (loading) return <DashboardSkeleton />;

  const grandTotal = data.reduce((s: number, g: any) => s + (g.score || 0), 0);
  const grandMax = data.reduce((s: number, g: any) => s + (g.assessments?.max_score || 100), 0);
  const overall = grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0;

  const termName = terms.find(t => t.id === selectedTermId)?.name || "";
  const subjectRows: Record<string, { scores: number[]; maxScores: number[]; name: string }> = {};
  for (const g of data) {
    const subId = g.assessments?.subject_id;
    if (!subId) continue;
    if (!subjectRows[subId]) subjectRows[subId] = { scores: [], maxScores: [], name: g.assessments?.subjects?.name || "" };
    subjectRows[subId].scores.push(g.score || 0);
    subjectRows[subId].maxScores.push(g.assessments?.max_score || 100);
  }

  const subjectSummary = Object.entries(subjectRows).map(([id, info]) => {
    const total = info.scores.reduce((s: number, v: number) => s + v, 0);
    const max = info.maxScores.reduce((s: number, v: number) => s + v, 0);
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 75 ? "B+" : pct >= 70 ? "B" : pct >= 65 ? "C+" : pct >= 60 ? "C" : pct >= 55 ? "D+" : pct >= 50 ? "D" : "F";
    return { id, name: info.name, score: total, max, pct, grade };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/parent" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Academic Performance</h1>
          <p className="text-sm text-slate-500">{student?.full_name} &middot; {student?.admission_number}</p>
        </div>
        {data.length > 0 && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating..." : "Download Report Card"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {terms.map(t => (
          <button key={t.id} onClick={() => setSelectedTermId(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedTermId === t.id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {t.name}
          </button>
        ))}
      </div>

      {subjectSummary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Overall</p>
              <p className="text-2xl font-bold text-slate-900">{overall}%</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Score</p>
              <p className="text-2xl font-bold text-slate-900">{grandTotal}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Subjects</p>
              <p className="text-2xl font-bold text-slate-900">{subjectSummary.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Subject Summary — {termName}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-white border-b text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Out of</th>
                <th className="px-6 py-4 text-right">Percentage</th>
                <th className="px-6 py-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjectSummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No grades published for this term yet.</td>
                </tr>
              ) : subjectSummary.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-800">{s.score}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{s.max}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${s.pct >= 50 ? "text-green-600" : "text-red-600"}`}>{s.pct}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.grade.startsWith("A") ? "bg-green-100 text-green-800" :
                      s.grade.startsWith("B") ? "bg-blue-100 text-blue-800" :
                      s.grade.startsWith("C") ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>{s.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-800">Assessment Breakdown</h3>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No assessment data available.</td>
                </tr>
              ) : data.map((g: any) => {
                const score = g.score || 0;
                const max = g.assessments?.max_score || 100;
                const pct = Math.round((score / max) * 100);
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
                      <span className={`font-bold ${pct >= 50 ? "text-green-600" : "text-red-600"}`}>{pct}%</span>
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