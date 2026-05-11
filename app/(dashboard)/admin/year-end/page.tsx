"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  computeTermResultsAction, computeYearResultsAction, evaluatePromotionAction,
  executeBulkPromotionAction, savePromotionRulesAction, getPromotionRulesAction,
  getYearEndDataAction,
} from "@/actions/promotion-actions";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, GraduationCap, RefreshCw, Save, Loader2 } from "lucide-react";

interface Evaluation {
  studentId: string; studentName: string; classId: string; className: string;
  classLevel: number; yearlyAvg: number; gradeLetter: string; position: number;
  passed: boolean; hasBalance: boolean; balance: number;
  nextClassId: string | null; nextClassName: string | null;
  outcome: string; blockedReason: string; eligible: boolean;
}

export default function YearEndPage() {
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [overrideOutcomes, setOverrideOutcomes] = useState<Record<string, string>>({});
  const [ruleEdits, setRuleEdits] = useState<Record<string, { minAvg: number; minSubject: number; requireAll: boolean }>>({});
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single();
      if (!profile) return;

      const { data: year } = await supabase
        .from("academic_years").select("*").eq("school_id", profile.school_id).eq("is_current", true).single();

      if (year) {
        setAcademicYear(year);
        const [yrData, rls, aud] = await Promise.all([
          getYearEndDataAction(year.id),
          getPromotionRulesAction(),
          supabase.from("promotion_audits").select("*, students(full_name)").eq("academic_year_id", year.id).order("created_at", { ascending: false }).limit(20),
        ]);
        setClasses(yrData.classes);
        setTerms(yrData.terms);
        setRules(rls.rules);
        setAudits(aud.data || []);

        const clsMap: Record<string, any> = {};
        yrData.classes.forEach((c: any) => { clsMap[c.id] = c; });
        yrData.rules.forEach((r: any) => {
          if (r.class_id) clsMap[r.class_id] = { ...clsMap[r.class_id], rule: r };
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleComputeTerms = async () => {
    setActionLoading(true);
    for (const term of terms) {
      await computeTermResultsAction(term.id);
    }
    setResultMsg({ success: true, message: `Term results computed for all ${terms.length} terms` });
    setActionLoading(false);
  };

  const handleComputeYear = async () => {
    if (!academicYear) return;
    setActionLoading(true);
    const res = await computeYearResultsAction(academicYear.id);
    setResultMsg({ success: res.success, message: res.message });
    setActionLoading(false);
  };

  const handleEvaluate = async () => {
    if (!academicYear) return;
    setActionLoading(true);
    const res = await evaluatePromotionAction(academicYear.id) as any;
    if (res.success && res.data) {
      setEvaluations(res.data.evaluations);
      setSummary(res.data.summary);
      const allEligible = (res.data.evaluations as Evaluation[]).filter((e: Evaluation) => e.eligible).map((e: Evaluation) => e.studentId);
      setSelectedStudents(new Set(allEligible));
    } else {
      setResultMsg({ success: false, message: res.message });
    }
    setActionLoading(false);
  };

  const handleRuleSave = async () => {
    setActionLoading(true);
    const ruleList = classes.map(c => ({
      classId: c.id,
      minAvgScore: ruleEdits[c.id]?.minAvg ?? 50,
      minSubjectScore: ruleEdits[c.id]?.minSubject ?? 40,
      requireAllSubjects: ruleEdits[c.id]?.requireAll ?? true,
    }));
    const res = await savePromotionRulesAction(ruleList);
    setResultMsg(res);
    setActionLoading(false);
  };

  const handlePromote = async () => {
    if (!academicYear) return;
    setActionLoading(true);

    const decisions = evaluations
      .filter(e => selectedStudents.has(e.studentId))
      .map(e => ({
        studentId: e.studentId,
        currentClassId: e.classId,
        outcome: (overrideOutcomes[e.studentId] || e.outcome) as any,
        nextClassId: overrideOutcomes[e.studentId] === "promoted" ? (e.nextClassId ?? undefined) : undefined,
      }));

    const res = await executeBulkPromotionAction(academicYear.id, decisions);
    setResultMsg({ success: res.success, message: res.message });

    if (res.success) {
      setEvaluations([]);
      setSummary(null);
      setSelectedStudents(new Set());
    }
    setActionLoading(false);
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudents);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedStudents(next);
  };

  const filteredEvaluations = evaluations.filter(e => {
    if (filter === "eligible") return e.eligible;
    if (filter === "blocked") return e.hasBalance;
    if (filter === "failed") return !e.passed;
    if (filter === "graduated") return e.outcome === "graduated";
    return true;
  });

  if (loading) return <div className="p-8"><div className="h-96 bg-slate-100 rounded animate-pulse" /></div>;

  if (!academicYear) return (
    <div className="p-8">
      <EmptyState icon="grades" title="No active academic year" description="Set up an academic year in Settings first." />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Year-End Processing</h1>
          <p className="text-sm text-slate-500">{academicYear.name}</p>
        </div>
        {resultMsg && (
          <div className={`text-sm px-4 py-2 rounded-lg font-medium ${resultMsg.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {resultMsg.message}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-amber-800 text-sm font-medium">Ensure all terms are closed, grades published, and fee balances reconciled before running promotions.</p>
      </div>

      <Tabs defaultValue="promotions">
        <TabsList>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="rules">Promotion Rules</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Total Students" value={summary?.total || evaluations.length || "—"} icon={<TrendingUp className="h-5 w-5 text-blue-600" />} />
            <StatCard title="Eligible" value={summary?.eligible || 0} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} />
            <StatCard title="Blocked (Fees)" value={summary?.blockedFees || 0} icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} />
            <StatCard title="Failed" value={summary?.failed || 0} icon={<XCircle className="h-5 w-5 text-red-600" />} />
            <StatCard title="Graduating" value={summary?.graduated || 0} icon={<GraduationCap className="h-5 w-5 text-indigo-600" />} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleComputeTerms} disabled={actionLoading} variant="outline">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Compute Term Results
            </Button>
            <Button onClick={handleComputeYear} disabled={actionLoading} variant="outline">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Compute Year Averages
            </Button>
            <Button onClick={handleEvaluate} disabled={actionLoading} className="bg-slate-900 hover:bg-slate-800">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Evaluate All Students
            </Button>
          </div>

          {evaluations.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {["all","eligible","blocked","failed","graduated"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {f}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <input type="checkbox" checked={selectedStudents.size === filteredEvaluations.filter(e => e.eligible).length} onChange={() => {
                          const eligibleIds = filteredEvaluations.filter(e => e.eligible).map(e => e.studentId);
                          setSelectedStudents(selectedStudents.size === eligibleIds.length ? new Set() : new Set(eligibleIds));
                        }} className="rounded" />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-center">Avg %</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Reason / Next Class</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvaluations.map(e => (
                      <TableRow key={e.studentId} className={!e.eligible ? "opacity-60" : ""}>
                        <TableCell>
                          <input type="checkbox" checked={selectedStudents.has(e.studentId)} disabled={!e.eligible} onChange={() => toggleStudent(e.studentId)} className="rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{e.studentName}</TableCell>
                        <TableCell>{e.className}</TableCell>
                        <TableCell className="text-center font-mono">{e.yearlyAvg.toFixed(1)}%</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            e.gradeLetter.startsWith("A") ? "bg-green-100 text-green-800" :
                            e.gradeLetter.startsWith("B") ? "bg-blue-100 text-blue-800" :
                            e.gradeLetter.startsWith("C") ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>{e.gradeLetter}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {e.eligible ? (
                            <span className="flex items-center justify-center gap-1 text-emerald-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Eligible</span>
                          ) : (
                            <span className="flex items-center justify-center gap-1 text-red-500 text-xs"><XCircle className="w-3.5 h-3.5" /> Blocked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={e.hasBalance ? "text-amber-600" : e.passed ? "text-emerald-600" : "text-red-600"}>{e.blockedReason}</span>
                          {e.nextClassName && e.eligible && <span className="ml-2 text-slate-500">→ {e.nextClassName}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedStudents.size > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between">
                  <span className="font-medium">{selectedStudents.size} student(s) selected</span>
                  <Button onClick={handlePromote} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GraduationCap className="w-4 h-4 mr-2" />}
                    Promote Selected
                  </Button>
                </div>
              )}
            </>
          )}

          {evaluations.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center text-slate-500">
              Click <strong>Evaluate All Students</strong> to analyze performance and generate promotion recommendations.
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Set minimum average scores and pass thresholds per class level. Leave class blank for a global default.</p>
            <Button onClick={handleRuleSave} disabled={actionLoading} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> Save Rules
            </Button>
          </div>

          {classes.map(cls => {
            const existing = rules.find(r => r.class_id === cls.id);
            const defaults = ruleEdits[cls.id] || {
              minAvg: existing?.min_avg_score ?? 50,
              minSubject: existing?.min_subject_score ?? 40,
              requireAll: existing?.require_all_subjects ?? true,
            };
            return (
              <div key={cls.id} className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-3">{cls.name} (Level {cls.level})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-slate-500">Min Average Score (%)</Label>
                    <Input type="number" min="0" max="100" value={defaults.minAvg} onChange={e => setRuleEdits(prev => ({
                      ...prev, [cls.id]: { ...(prev[cls.id] || defaults), minAvg: parseInt(e.target.value) || 0 }
                    }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Min Subject Score (%)</Label>
                    <Input type="number" min="0" max="100" value={defaults.minSubject} onChange={e => setRuleEdits(prev => ({
                      ...prev, [cls.id]: { ...(prev[cls.id] || defaults), minSubject: parseInt(e.target.value) || 0 }
                    }))} className="mt-1" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={defaults.requireAll} onChange={e => setRuleEdits(prev => ({
                        ...prev, [cls.id]: { ...(prev[cls.id] || defaults), requireAll: e.target.checked }
                      }))} className="rounded" />
                      Require all subjects
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          {audits.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center text-slate-500">No promotion records yet.</div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="font-medium text-sm">{a.students?.full_name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{a.from_class_id}</TableCell>
                      <TableCell className="text-sm text-slate-600">{a.to_class_id || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${
                          a.outcome === "promoted" ? "border-emerald-400 text-emerald-700" :
                          a.outcome === "graduated" ? "border-indigo-400 text-indigo-700" :
                          a.outcome === "repeated" ? "border-amber-400 text-amber-700" :
                          "border-red-400 text-red-700"
                        }`}>{a.outcome}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
