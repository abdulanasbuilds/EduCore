"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { schoolConfig } from "@/lib/env";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportCardTemplate } from "@/components/pdf/report-card";

export async function generateReportCardAction(
  studentId: string,
  termId: string
): Promise<{ success: boolean; buffer?: ArrayBuffer; error?: string }> {
  try {
    const admin = createAdminClient() as any;

    const { data: student } = await admin
      .from("students")
      .select("full_name, admission_number")
      .eq("id", studentId)
      .single();

    const { data: term } = await admin
      .from("terms")
      .select("name, academic_year_id, academic_years(name)")
      .eq("id", termId)
      .single();

    const { data: classHistory } = await admin
      .from("student_class_history")
      .select("class_id, classes(name)")
      .eq("student_id", studentId)
      .eq("academic_year_id", term?.academic_year_id)
      .eq("is_current", true)
      .limit(1)
      .single();

    const { data: assessments } = await admin
      .from("assessments")
      .select("subject_id, subjects(name), max_score")
      .eq("term_id", termId)
      .eq("is_published", true);

    const { data: grades } = await admin
      .from("grades")
      .select("score, assessments(subject_id)")
      .eq("student_id", studentId);

    if (!student || !term) {
      return { success: false, error: "Student or term not found" };
    }

    const subjectMap: Record<string, { classwork: number; exam: number; count: number }> = {};
    const totalBySubject: Record<string, number> = {};
    const maxBySubject: Record<string, number> = {};

    for (const grade of grades || []) {
      const subId = (grade.assessments as any)?.subject_id;
      if (!subId) continue;
      if (!subjectMap[subId]) subjectMap[subId] = { classwork: 0, exam: 0, count: 0 };

      const score = grade.score || 0;
      const max = (grade.assessments as any)?.max_score || 100;
      if (!totalBySubject[subId]) totalBySubject[subId] = 0;
      if (!maxBySubject[subId]) maxBySubject[subId] = 0;
      totalBySubject[subId] += score;
      maxBySubject[subId] += max;
      subjectMap[subId].count++;
    }

    const gradeRows = Object.entries(subjectMap).map(([subId, vals]) => {
      const total = totalBySubject[subId] || 0;
      const max = maxBySubject[subId] || 100;
      const pct = max > 0 ? Math.round((total / max) * 100) : 0;
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
      const subName = assessments?.find((a: any) => a.subject_id === subId)?.subjects?.name || "Unknown";
      return { subject: subName, classwork: "—", exam: "—", total: `${pct}%`, grade };
    });

    const data = {
      school: {
        name: schoolConfig.name,
        logo_url: schoolConfig.logoUrl,
        motto: schoolConfig.tagline,
      },
      student: {
        full_name: student.full_name,
        admission_number: student.admission_number,
      },
      class_name: classHistory?.classes?.name || "—",
      term_name: term.name,
      academicYear: term.academic_years?.name || "",
      grades: gradeRows,
    };

    const buffer = await renderToBuffer(ReportCardTemplate({ data }));
    return { success: true, buffer: buffer as unknown as ArrayBuffer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateTermSummaryAction(
  studentId: string,
  termId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const admin = createAdminClient() as any;

    const { data: student } = await admin
      .from("students")
      .select("full_name, admission_number")
      .eq("id", studentId)
      .single();

    const { data: term } = await admin
      .from("terms")
      .select("*, academic_years(name)")
      .eq("id", termId)
      .single();

    const { data: grades } = await admin
      .from("grades")
      .select("*, assessments(*, subjects(*), assessment_types(*))")
      .eq("student_id", studentId);

    if (!student || !term) return { success: false, error: "Not found" };

    const termGrades = (grades || []).filter((g: any) => g.assessments?.term_id === termId && g.assessments?.is_published);

    const subjectMap: Record<string, { scores: number[]; maxScores: number[]; name: string; type: string }> = {};
    for (const g of termGrades) {
      const subId = g.assessments?.subject_id;
      const subName = g.assessments?.subjects?.name || "Unknown";
      const typeName = g.assessments?.assessment_types?.name || "Assessment";
      if (!subjectMap[subId]) subjectMap[subId] = { scores: [], maxScores: [], name: subName, type: typeName };
      subjectMap[subId].scores.push(g.score || 0);
      subjectMap[subId].maxScores.push(g.assessments?.max_score || 100);
    }

    const subjects = Object.entries(subjectMap).map(([id, info]) => {
      const totalScore = info.scores.reduce((s, v) => s + v, 0);
      const totalMax = info.maxScores.reduce((s, v) => s + v, 0);
      const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
      const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 75 ? "B+" : pct >= 70 ? "B" : pct >= 65 ? "C+" : pct >= 60 ? "C" : pct >= 55 ? "D+" : pct >= 50 ? "D" : "F";
      return { id, name: info.name, type: info.type, score: totalScore, max: totalMax, pct, grade };
    });

    const grandTotal = subjects.reduce((s, sub) => s + sub.score, 0);
    const grandMax = subjects.reduce((s, sub) => s + sub.max, 0);
    const overall = grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0;

    return {
      success: true,
      data: { student, term, subjects, grandTotal, grandMax, overall, classAverage: 0 },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}