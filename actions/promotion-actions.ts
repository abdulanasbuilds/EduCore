"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse } from "@/types";
import { z } from "zod";
import { schoolConfig, features } from "@/lib/env";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { promotionNotice } from "@/lib/notifications/templates";

const gradeLetter = (score: number, passmark = 50): string => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "D+";
  if (score >= 50) return "D";
  if (score >= passmark) return "E";
  return "F";
};

const promotionRuleSchema = z.object({
  classId: z.string().uuid().optional(),
  minAvgScore: z.number().min(0).max(100),
  minSubjectScore: z.number().min(0).max(100),
  requireAllSubjects: z.boolean(),
});

export async function savePromotionRulesAction(
  rules: z.infer<typeof promotionRuleSchema>[]
): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles").select("school_id").eq("id", user.id).single() as any;
    if (!profile?.school_id) return { success: false, message: "No school found" };

    const admin = createAdminClient() as any;

    for (const rule of rules) {
      await admin.from("promotion_rules").upsert({
        school_id: profile.school_id,
        class_id: rule.classId || null,
        min_avg_score: rule.minAvgScore,
        min_subject_score: rule.minSubjectScore,
        require_all_subjects: rule.requireAllSubjects,
        updated_at: new Date().toISOString(),
      } as any);
    }

    return { success: true, message: "Promotion rules saved" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function getPromotionRulesAction(): Promise<{ rules: any[] }> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { rules: [] };

    const { data: profile } = await supabase
      .from("profiles").select("school_id").eq("id", user.id).single() as any;

    const { data: rules } = await supabase
      .from("promotion_rules")
      .select("*, classes(name)")
      .eq("school_id", profile?.school_id);

    return { rules: rules ?? [] };
  } catch {
    return { rules: [] };
  }
}

export async function computeTermResultsAction(
  termId: string
): Promise<ActionResponse<{ computed: number }>> {
  try {
    const admin = createAdminClient() as any;

    const { data: term } = await admin
      .from("terms").select("*, academic_years(id, school_id)").eq("id", termId).single();
    if (!term) return { success: false, message: "Term not found" };

    const schoolId = term.academic_years.school_id;

    const { data: assessments } = await admin
      .from("assessments")
      .select("id, class_id, subject_id, max_score, term_id")
      .eq("term_id", termId)
      .eq("is_published", true);

    if (!assessments?.length) return { success: false, message: "No published assessments found" };

    const { data: allGrades } = await admin
      .from("grades")
      .select("*, assessments(max_score, class_id, subject_id)")
      .not("score", "is", null);

    const { data: students } = await admin
      .from("student_class_history")
      .select("student_id, class_id")
      .eq("academic_year_id", term.academic_year_id)
      .eq("is_current", true);

    if (!students) return { success: false, message: "No students found" };

    const studentIds = [...new Set(students.map((s: any) => s.student_id))];
    let computed = 0;

    for (const studentId of studentIds) {
      const studentClasses = students.filter((s: any) => s.student_id === studentId);
      const classId = studentClasses[0]?.class_id;
      if (!classId) continue;

      const studentGrades = (allGrades || []).filter((g: any) => {
        const a = g.assessments;
        return g.student_id === studentId && a?.term_id === termId && a?.class_id === classId;
      });

      if (studentGrades.length === 0) continue;

      let totalScore = 0;
      let maxPossible = 0;
      let passedSubjects = 0;
      const subjectIds = new Set<string>();

      for (const grade of studentGrades) {
        const a = grade.assessments;
        if (!a) continue;
        const max = a.max_score || 100;
        const score = ((grade.score || 0) / max) * 100;
        totalScore += grade.score || 0;
        maxPossible += max;
        subjectIds.add(a.subject_id);
        if (score >= 50) passedSubjects++;
      }

      const avgScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
      const grade = gradeLetter(avgScore);
      const passed = avgScore >= 50;

      await admin.from("term_results").upsert({
        school_id: schoolId,
        student_id: studentId,
        term_id: termId,
        academic_year_id: term.academic_year_id,
        class_id: classId,
        total_score: totalScore,
        max_score: maxPossible,
        avg_score: Math.round(avgScore * 100) / 100,
        grade_letter: grade,
        passed,
        subject_count: subjectIds.size,
        subjects_passed: passedSubjects,
        computed_at: new Date().toISOString(),
      } as any, { onConflict: "student_id,term_id" });

      computed++;
    }

    return { success: true, message: `Results computed for ${computed} students`, data: { computed } };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function computeYearResultsAction(
  academicYearId: string
): Promise<ActionResponse<{ computed: number }>> {
  try {
    const admin = createAdminClient() as any;

    const { data: year } = await admin
      .from("academic_years").select("*, school_id").eq("id", academicYearId).single();
    if (!year) return { success: false, message: "Year not found" };

    const { data: terms } = await admin
      .from("terms").select("id").eq("academic_year_id", academicYearId).order("term_number");

    const { data: termResults } = await admin
      .from("term_results")
      .select("*")
      .eq("academic_year_id", academicYearId);

    if (!termResults?.length) return { success: false, message: "No term results to aggregate" };

    const studentIds = [...new Set(termResults.map((r: any) => r.student_id))];
    let computed = 0;

    for (const studentId of studentIds) {
      const studentResults = termResults.filter((r: any) => r.student_id === studentId);
      const classId = studentResults[0]?.class_id;

      const t1 = studentResults.find((r: any) => r.term_id === terms?.[0]?.id);
      const t2 = studentResults.find((r: any) => r.term_id === terms?.[1]?.id);
      const t3 = studentResults.find((r: any) => r.term_id === terms?.[2]?.id);

      const avgs = [t1?.avg_score || 0, t2?.avg_score || 0, t3?.avg_score || 0].filter(a => a > 0);
      const yearlyAvg = avgs.length > 0 ? avgs.reduce((s, a) => s + a, 0) / avgs.length : 0;

      const maxScore = studentResults.reduce((s: number, r: any) => s + (r.max_score || 0), 0);
      const grade = gradeLetter(yearlyAvg);
      const passed = yearlyAvg >= 50;

      await admin.from("year_results").upsert({
        school_id: year.school_id,
        student_id: studentId,
        academic_year_id: academicYearId,
        class_id: classId,
        term1_avg: t1?.avg_score || 0,
        term2_avg: t2?.avg_score || 0,
        term3_avg: t3?.avg_score || 0,
        yearly_avg: Math.round(yearlyAvg * 100) / 100,
        max_score: maxScore,
        grade_letter: grade,
        passed,
        outcome: "pending",
        computed_at: new Date().toISOString(),
      } as any, { onConflict: "student_id,academic_year_id" });

      computed++;
    }

    return { success: true, message: `Year results computed for ${computed} students`, data: { computed } };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function evaluatePromotionAction(
  academicYearId: string
): Promise<ActionResponse<{ evaluations: any[]; summary: any }>> {
  try {
    const admin = createAdminClient() as any;

    const { data: school } = await admin.from("schools").select("id").limit(1).single();
    if (!school) return { success: false, message: "No school found" };

    const { data: rules } = await admin
      .from("promotion_rules")
      .select("*")
      .eq("school_id", school.id);

    const { data: yearResults } = await admin
      .from("year_results")
      .select("*, students(full_name, status), classes(name, level)")
      .eq("academic_year_id", academicYearId)
      .eq("passed", false);

    const { data: allPassed } = await admin
      .from("year_results")
      .select("*, students(full_name, status), classes(name, level)")
      .eq("academic_year_id", academicYearId)
      .eq("passed", true);

    const { data: classes } = await admin
      .from("classes")
      .select("id, name, level")
      .eq("school_id", school.id)
      .order("level");

    const evaluations: any[] = [];

    for (const result of [...(allPassed || []), ...(yearResults || [])]) {
      const rule = rules?.find((r: any) => r.class_id === result.class_id) || rules?.find((r: any) => !r.class_id);
      const minAvg = rule?.min_avg_score ?? 50;

      const { data: feeBalance } = await admin
        .from("student_fees")
        .select("balance")
        .eq("student_id", result.student_id);

      const balance = feeBalance?.reduce((s: number, f: any) => s + (f.balance || 0), 0) || 0;
      const hasBalance = balance > 0;

      const { data: nextClass } = result.passed && !hasBalance && classes
        ? classes.find((c: any) => c.level === (result.classes?.level || 0) + 1)
        : null;

      const isFinalLevel = !nextClass;
      const outcome = !result.passed
        ? "repeated"
        : isFinalLevel
          ? "graduated"
          : "promoted";

      const blockedReason = hasBalance
        ? `Outstanding balance: GHS ${(balance / 100).toFixed(2)}`
        : result.passed
          ? isFinalLevel
            ? "Final level — graduation"
            : "Eligible for promotion"
          : `Average ${result.yearly_avg}% below ${minAvg}% threshold`;

      evaluations.push({
        studentId: result.student_id,
        studentName: result.students?.full_name,
        classId: result.class_id,
        className: result.classes?.name,
        classLevel: result.classes?.level,
        yearlyAvg: result.yearly_avg,
        gradeLetter: result.grade_letter,
        position: result.position,
        passed: result.passed,
        hasBalance,
        balance,
        nextClassId: nextClass?.id || null,
        nextClassName: nextClass?.name || null,
        outcome,
        blockedReason,
        eligible: result.passed && !hasBalance,
      });
    }

    const eligible = evaluations.filter(e => e.eligible).length;
    const blockedFees = evaluations.filter(e => e.hasBalance && e.passed).length;
    const failed = evaluations.filter(e => !e.passed).length;
    const graduated = evaluations.filter(e => e.outcome === "graduated").length;

    return {
      success: true,
      message: `Evaluated ${evaluations.length} students`,
      data: {
        evaluations,
        summary: { total: evaluations.length, eligible, blockedFees, failed, graduated },
      },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function executeBulkPromotionAction(
  academicYearId: string,
  decisions: Array<{
    studentId: string;
    currentClassId: string;
    outcome: "promoted" | "repeated" | "graduated" | "withdrawn";
    nextClassId?: string;
  }>
): Promise<ActionResponse<{ promoted: number; repeated: number; graduated: number; errors: string[] }>> {
  try {
    const admin = createAdminClient() as any;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: school } = await admin.from("schools").select("id, name").limit(1).single();
    if (!school) return { success: false, message: "No school found" };

    const { data: nextYear } = await admin
      .from("academic_years")
      .select("id")
      .eq("school_id", school.id)
      .eq("status", "active")
      .neq("id", academicYearId)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    let promoted = 0, repeated = 0, graduated = 0;
    const errors: string[] = [];

    for (const decision of decisions) {
      try {
        await admin.from("student_class_history")
          .update({
            is_current: false,
            outcome: decision.outcome,
            completed_date: new Date().toISOString().split("T")[0],
          } as any)
          .eq("student_id", decision.studentId)
          .eq("class_id", decision.currentClassId)
          .eq("academic_year_id", academicYearId);

        if (decision.outcome === "promoted" && decision.nextClassId && nextYear) {
          await admin.from("student_class_history").insert({
            student_id: decision.studentId,
            class_id: decision.nextClassId,
            academic_year_id: nextYear.id,
            is_current: true,
            outcome: "active" as const,
            enrolled_date: new Date().toISOString().split("T")[0],
          } as any);

          const { data: term } = await admin.from("terms").select("id").eq("academic_year_id", nextYear.id).eq("status", "upcoming").limit(1).single();
          if (term) {
            const { data: feeAssignments } = await admin
              .from("fee_assignments").select("id, amount, due_date, fee_type_id").eq("term_id", term.id).eq("class_id", decision.nextClassId);
            if (feeAssignments?.length) {
              const feeRecords = feeAssignments.map((fa: any) => ({
                student_id: decision.studentId,
                fee_assignment_id: fa.id,
                amount_owed: fa.amount,
                amount_paid: 0,
                balance: fa.amount,
                status: "Unpaid" as const,
              }));
              await admin.from("student_fees").insert(feeRecords);
            }
          }

          promoted++;
        } else if (decision.outcome === "repeated" && nextYear) {
          await admin.from("student_class_history").insert({
            student_id: decision.studentId,
            class_id: decision.currentClassId,
            academic_year_id: nextYear.id,
            is_current: true,
            outcome: "active" as const,
            enrolled_date: new Date().toISOString().split("T")[0],
          } as any);

          repeated++;
        } else if (decision.outcome === "graduated") {
          await admin.from("students")
            .update({ status: "Graduated" as const } as any)
            .eq("id", decision.studentId);

          await admin.from("graduation_records").insert({
            school_id: school.id,
            student_id: decision.studentId,
            academic_year_id: academicYearId,
            graduation_date: new Date().toISOString().split("T")[0],
            class_completed: decision.currentClassId,
            created_by: user.id,
          } as any);

          graduated++;
        }

        await admin.from("promotion_audits").insert({
          school_id: school.id,
          academic_year_id: academicYearId,
          student_id: decision.studentId,
          from_class_id: decision.currentClassId,
          to_class_id: decision.nextClassId || null,
          outcome: decision.outcome,
          fee_cleared: decision.outcome !== "graduated",
          created_at: new Date().toISOString(),
        } as any);
      } catch (e: any) {
        errors.push(`${decision.studentId}: ${e.message}`);
      }
    }

    const sendNotifications = async () => {
      for (const decision of decisions) {
        const { data: student } = await admin
          .from("students").select("full_name").eq("id", decision.studentId).single();
        const { data: guardian } = await admin
          .from("student_guardians")
          .select("guardians(full_name, phone, whatsapp_number)")
          .eq("student_id", decision.studentId)
          .eq("is_primary", true)
          .single();
        const g = guardian?.guardians;
        if (!g) continue;
        const parentName = g.full_name;
        const phone = g.whatsapp_number || g.phone;
        const { data: nextClass } = decision.outcome === "promoted"
          ? await admin.from("classes").select("name").eq("id", decision.nextClassId).single()
          : { data: null };
        const msg = promotionNotice(parentName, student?.full_name || "", decision.outcome, nextClass?.name || "", schoolConfig.name);
        if (phone) {
          await sendWhatsApp({ to: phone, message: msg, recipientName: parentName, type: "promotion" }).catch(() => {});
          if (!features.smsEnabled) {
            await sendSMS({ to: phone, message: msg, recipientName: parentName, type: "promotion" }).catch(() => {});
          }
        }
      }
    };
    sendNotifications().catch(console.error);

    if (nextYear) {
      await admin.from("academic_years").update({ is_current: false } as any).eq("id", academicYearId);
      await admin.from("academic_years").update({ is_current: true } as any).eq("id", nextYear.id);
    }

    return {
      success: true,
      message: `Done: ${promoted} promoted, ${repeated} repeated, ${graduated} graduated. ${errors.length} errors.`,
      data: { promoted, repeated, graduated, errors },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function getYearEndDataAction(academicYearId: string): Promise<{
  students: any[];
  classes: any[];
  terms: any[];
  yearResults: any[];
  promotionAudits: any[];
  rules: any[];
}> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { students: [], classes: [], terms: [], yearResults: [], promotionAudits: [], rules: [] };

    const { data: profile } = await supabase
      .from("profiles").select("school_id").eq("id", user.id).single() as any;

    const [{ data: cls }, { data: trms }, { data: yRes }, { data: aud }, { data: rls }] = await Promise.all([
      supabase.from("classes").select("id, name, level").eq("school_id", profile?.school_id).order("level"),
      supabase.from("terms").select("id, name, term_number, status").eq("academic_year_id", academicYearId).order("term_number"),
      supabase.from("year_results").select("*, students(full_name), classes(name,level)").eq("academic_year_id", academicYearId),
      supabase.from("promotion_audits").select("*, students(full_name), classes(name)").eq("academic_year_id", academicYearId),
      supabase.from("promotion_rules").select("*, classes(name)").eq("school_id", profile?.school_id),
    ]);

    return {
      students: yRes || [],
      classes: cls || [],
      terms: trms || [],
      yearResults: yRes || [],
      promotionAudits: aud || [],
      rules: rls || [],
    };
  } catch {
    return { students: [], classes: [], terms: [], yearResults: [], promotionAudits: [], rules: [] };
  }
}
