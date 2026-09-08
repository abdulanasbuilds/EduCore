"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse } from "@/types";
import { z } from "zod";
import { getGradeLetter, calculateWeightedPercentage } from "@/lib/academics/grading";

const promotionRuleSchema = z.object({
  classId: z.string().uuid().optional(),
  minAvgScore: z.number().min(0).max(100),
  minSubjectScore: z.number().min(0).max(100),
  requireAllSubjects: z.boolean(),
});

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) return { error: "Authentication required." };
  const { data: profile } = await supabase.from("profiles").select("id, role, school_id, is_active").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found." };
  if (!profile.is_active) return { error: "Account is inactive." };
  if (!profile.school_id) return { error: "No school assigned to this account." };
  if (!["school_admin", "class_teacher", "subject_teacher"].includes(profile.role)) return { error: "You do not have permission for this action." };
  return { supabase, user, profile };
}

export async function savePromotionRulesAction(rules: z.infer<typeof promotionRuleSchema>[]): Promise<ActionResponse> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { success: false, message: auth.error };
    if (auth.profile.role !== "school_admin") return { success: false, message: "Only school admins can change promotion rules." };
    for (const rule of rules) {
      const { error } = await auth.supabase.from("promotion_rules").upsert({
        school_id: auth.profile.school_id,
        class_id: rule.classId || null,
        min_avg_score: rule.minAvgScore,
        min_subject_score: rule.minSubjectScore,
        require_all_subjects: rule.requireAllSubjects,
        updated_at: new Date().toISOString(),
      });
      if (error) return { success: false, message: error.message };
    }
    return { success: true, message: "Promotion rules saved" };
  } catch { return { success: false, message: "An unexpected error occurred" }; }
}

export async function getPromotionRulesAction(): Promise<{ rules: any[] }> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { rules: [] };
    const { data } = await auth.supabase.from("promotion_rules").select("*, classes(name)").eq("school_id", auth.profile.school_id);
    return { rules: data || [] };
  } catch { return { rules: [] }; }
}

export async function computeTermResultsAction(termId: string): Promise<ActionResponse<{ computed: number }>> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { success: false, message: auth.error };
    const admin = createAdminClient() as any;
    const { data: term } = await admin.from("terms").select("id, academic_year_id, school_id").eq("id", termId).eq("school_id", auth.profile.school_id).single();
    if (!term) return { success: false, message: "Term not found" };

    const { data: assessments } = await admin.from("assessments")
      .select("id, class_id, subject_id, assessment_type_id, max_score, assessment_types(weight)")
      .eq("term_id", termId).eq("school_id", auth.profile.school_id).eq("is_published", true);
    if (!assessments?.length) return { success: false, message: "No published assessments found" };

    const assessmentIds = assessments.map((a: any) => a.id);
    const { data: grades } = await admin.from("grades").select("assessment_id, student_id, score").in("assessment_id", assessmentIds);
    const { data: enrollments } = await admin.from("student_class_history")
      .select("student_id, class_id").eq("academic_year_id", term.academic_year_id).eq("is_current", true);

    const enrollmentMap = new Map((enrollments || []).map((e: any) => [e.student_id, e.class_id]));
    let computed = 0;

    for (const studentId of [...new Set((grades || []).map((g: any) => g.student_id))]) {
      const classId = enrollmentMap.get(studentId);
      if (!classId) continue;
      const studentGrades = (grades || []).filter((g: any) => g.student_id === studentId);
      const subjectIds = [...new Set(studentGrades.map((g: any) => assessments.find((a: any) => a.id === g.assessment_id)?.subject_id).filter(Boolean))];
      const subjectResults: number[] = [];

      for (const subjectId of subjectIds) {
        const items = studentGrades
          .map((g: any) => {
            const a = assessments.find((x: any) => x.id === g.assessment_id && x.subject_id === subjectId && x.class_id === classId);
            if (!a || g.score === null) return null;
            const weight = Number(a.assessment_types?.weight ?? 0);
            return { score: Number(g.score), maxScore: Number(a.max_score), weight };
          })
          .filter(Boolean) as Array<{ score: number; maxScore: number; weight: number }>;
        if (items.length) subjectResults.push(calculateWeightedPercentage(items));
      }

      if (!subjectResults.length) continue;
      const avgScore = Math.round((subjectResults.reduce((s, v) => s + v, 0) / subjectResults.length) * 100) / 100;
      const passedSubjects = subjectResults.filter((v) => v >= 50).length;
      const { error } = await admin.from("term_results").upsert({
        school_id: auth.profile.school_id,
        student_id: studentId,
        term_id: termId,
        academic_year_id: term.academic_year_id,
        class_id: classId,
        total_score: avgScore,
        max_score: 100,
        avg_score: avgScore,
        grade_letter: getGradeLetter(avgScore),
        passed: avgScore >= 50,
        subject_count: subjectResults.length,
        subjects_passed: passedSubjects,
        computed_at: new Date().toISOString(),
      }, { onConflict: "student_id,term_id" });
      if (error) return { success: false, message: error.message };
      computed++;
    }
    return { success: true, message: `Results computed for ${computed} students`, data: { computed } };
  } catch (err) { console.error(err); return { success: false, message: "An unexpected error occurred" }; }
}

export async function computeYearResultsAction(academicYearId: string): Promise<ActionResponse<{ computed: number }>> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { success: false, message: auth.error };
    const admin = createAdminClient() as any;
    const { data: year } = await admin.from("academic_years").select("id, school_id").eq("id", academicYearId).eq("school_id", auth.profile.school_id).single();
    if (!year) return { success: false, message: "Academic year not found" };
    const { data: terms } = await admin.from("terms").select("id, term_number").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id).order("term_number");
    const { data: termResults } = await admin.from("term_results").select("student_id, term_id, class_id, avg_score").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id);
    if (!termResults?.length) return { success: false, message: "No term results to aggregate" };
    let computed = 0;
    for (const studentId of [...new Set(termResults.map((r: any) => r.student_id))]) {
      const results = termResults.filter((r: any) => r.student_id === studentId);
      const avg = results.length ? results.reduce((s: number, r: any) => s + Number(r.avg_score || 0), 0) / results.length : 0;
      const byTerm = (n: number) => { const id = terms?.find((t: any) => t.term_number === n)?.id; return results.find((r: any) => r.term_id === id)?.avg_score || 0; };
      const { error } = await admin.from("year_results").upsert({
        school_id: auth.profile.school_id,
        student_id: studentId,
        academic_year_id: academicYearId,
        class_id: results[0].class_id,
        term1_avg: byTerm(1), term2_avg: byTerm(2), term3_avg: byTerm(3),
        yearly_avg: Math.round(avg * 100) / 100,
        max_score: 100,
        grade_letter: getGradeLetter(avg),
        passed: avg >= 50,
        outcome: "pending",
        computed_at: new Date().toISOString(),
      }, { onConflict: "student_id,academic_year_id" });
      if (error) return { success: false, message: error.message };
      computed++;
    }
    return { success: true, message: `Year results computed for ${computed} students`, data: { computed } };
  } catch (err) { console.error(err); return { success: false, message: "An unexpected error occurred" }; }
}

export async function evaluatePromotionAction(academicYearId: string): Promise<ActionResponse<{ evaluations: any[]; summary: any }>> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { success: false, message: auth.error };
    const admin = createAdminClient() as any;
    const { data: year } = await admin.from("academic_years").select("id, school_id").eq("id", academicYearId).eq("school_id", auth.profile.school_id).single();
    if (!year) return { success: false, message: "Academic year not found" };
    const [{ data: classes }, { data: results }, { data: rules }, { data: students }] = await Promise.all([
      admin.from("classes").select("id, name, level").eq("school_id", auth.profile.school_id),
      admin.from("year_results").select("student_id, class_id, yearly_avg, grade_letter, passed").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id),
      admin.from("promotion_rules").select("*").eq("school_id", auth.profile.school_id),
      admin.from("students").select("id, full_name, status").eq("school_id", auth.profile.school_id).eq("status", "Active"),
    ]);
    const { data: assignments } = await admin.from("fee_assignments").select("id, term_id").eq("term_id", (await admin.from("terms").select("id").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id).order("term_number", { ascending: false }).limit(1).single()).data?.id || "");
    const feeIds = (assignments || []).map((a: any) => a.id);
    const { data: fees } = feeIds.length ? await admin.from("student_fees").select("student_id, balance").in("fee_assignment_id", feeIds) : { data: [] } as any;
    const balanceMap: Record<string, number> = {};
    (fees || []).forEach((f: any) => balanceMap[f.student_id] = (balanceMap[f.student_id] || 0) + Number(f.balance || 0));

    const resultMap = new Map((results || []).map((r: any) => [r.student_id, r]));
    const classMap = new Map((classes || []).map((c: any) => [c.id, c]));
    const evaluations = (students || []).flatMap((student: any) => {
      const r = resultMap.get(student.id);
      if (!r) return [];
      const current = classMap.get(r.class_id);
      if (!current) return [];
      const rule = (rules || []).find((x: any) => x.class_id === current.id) || (rules || []).find((x: any) => x.class_id === null) || { min_avg_score: 50, min_subject_score: 40, require_all_subjects: true };
      const balance = balanceMap[student.id] || 0;
      const next = (classes || []).find((c: any) => c.level === Number(current.level) + 1);
      const passed = Number(r.yearly_avg) >= Number(rule.min_avg_score) && r.passed;
      const outcome = !next && passed ? "graduated" : passed ? "promoted" : "repeated";
      const hasBalance = balance > 0;
      return [{ studentId: student.id, studentName: student.full_name, classId: current.id, className: current.name, classLevel: current.level, yearlyAvg: Number(r.yearly_avg || 0), gradeLetter: r.grade_letter || getGradeLetter(Number(r.yearly_avg || 0)), position: 0, passed, hasBalance, balance, nextClassId: next?.id || null, nextClassName: next?.name || null, outcome, blockedReason: hasBalance ? "Outstanding fees" : passed ? (outcome === "graduated" ? "Graduation recommended" : "Eligible for promotion") : `Below ${rule.min_avg_score}% promotion threshold`, eligible: !hasBalance && passed }];
    });

    const grouped: Record<string, any[]> = {};
    evaluations.forEach((e: any) => (grouped[e.classId] ||= []).push(e));
    Object.values(grouped).forEach((arr: any[]) => arr.sort((a, b) => b.yearlyAvg - a.yearlyAvg).forEach((e, i) => e.position = i + 1));
    const summary = {
      total: evaluations.length,
      eligible: evaluations.filter((e: any) => e.eligible).length,
      blockedFees: evaluations.filter((e: any) => e.hasBalance).length,
      failed: evaluations.filter((e: any) => !e.passed).length,
      graduated: evaluations.filter((e: any) => e.outcome === "graduated").length,
    };
    return { success: true, message: "Promotion evaluation complete", data: { evaluations, summary } };
  } catch (err) { console.error(err); return { success: false, message: "An unexpected error occurred" }; }
}

export async function executeBulkPromotionAction(academicYearId: string, decisions: Array<{ studentId: string; currentClassId: string; outcome: "promoted" | "repeated" | "graduated" | "withdrawn"; nextClassId?: string }>): Promise<ActionResponse> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { success: false, message: auth.error };
    if (auth.profile.role !== "school_admin") return { success: false, message: "Only school admins can execute promotions." };
    const admin = createAdminClient() as any;
    const { data: year } = await admin.from("academic_years").select("id, school_id").eq("id", academicYearId).eq("school_id", auth.profile.school_id).single();
    if (!year) return { success: false, message: "Academic year not found" };
    let processed = 0;
    for (const decision of decisions) {
      const { data: current } = await admin.from("student_class_history").select("id").eq("student_id", decision.studentId).eq("class_id", decision.currentClassId).eq("academic_year_id", academicYearId).eq("is_current", true).single();
      if (!current) continue;
      let toClassId: string | null = null;
      if (decision.outcome === "promoted") toClassId = decision.nextClassId || null;
      if (decision.outcome === "repeated") toClassId = decision.currentClassId;
      if (decision.outcome === "graduated") { await admin.from("students").update({ status: "Graduated" }).eq("id", decision.studentId).eq("school_id", auth.profile.school_id); }
      await admin.from("student_class_history").update({ is_current: false, outcome: decision.outcome, completed_date: new Date().toISOString().slice(0, 10) }).eq("id", current.id);
      if (toClassId && decision.outcome !== "graduated") {
        await admin.from("student_class_history").insert({ student_id: decision.studentId, class_id: toClassId, academic_year_id: academicYearId, outcome: "active", is_current: true });
      }
      await admin.from("promotion_audits").insert({ school_id: auth.profile.school_id, academic_year_id: academicYearId, student_id: decision.studentId, from_class_id: decision.currentClassId, to_class_id: toClassId, outcome: decision.outcome, override_by: auth.user.id });
      processed++;
    }
    return { success: true, message: `Processed ${processed} promotion decision(s)` };
  } catch (err) { console.error(err); return { success: false, message: "An unexpected error occurred" }; }
}

export async function getYearEndDataAction(academicYearId: string): Promise<{ students: any[]; classes: any[]; terms: any[]; rules: any[]; yearResults: any[]; audits: any[] }> {
  try {
    const auth = await requireStaff();
    if ("error" in auth) return { students: [], classes: [], terms: [], rules: [], yearResults: [], audits: [] };
    const admin = createAdminClient() as any;
    const [{ data: students }, { data: classes }, { data: terms }, { data: rules }, { data: yearResults }, { data: audits }] = await Promise.all([
      admin.from("student_class_history").select("student_id, class_id, students(full_name), classes(name, level)").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id).eq("is_current", true),
      admin.from("classes").select("id, name, level, capacity").eq("school_id", auth.profile.school_id).order("level"),
      admin.from("terms").select("id, name, term_number, start_date, end_date").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id).order("term_number"),
      admin.from("promotion_rules").select("*, classes(name)").eq("school_id", auth.profile.school_id),
      admin.from("year_results").select("*").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id),
      admin.from("promotion_audits").select("*, students(full_name), classes(name)").eq("academic_year_id", academicYearId).eq("school_id", auth.profile.school_id).order("created_at", { ascending: false }).limit(100),
    ]);
    return { students: students || [], classes: classes || [], terms: terms || [], rules: rules || [], yearResults: yearResults || [], audits: audits || [] };
  } catch { return { students: [], classes: [], terms: [], rules: [], yearResults: [], audits: [] }; }
}
