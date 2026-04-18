"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitGradesAction, publishAssessmentAction } from "@/actions/grade-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Check, Save, Send } from "lucide-react";

export default function TeacherGradesPage() {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, { score: number | string; remarks: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadAssessments() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("assessments")
        .select("*, classes(name), subjects(name)")
        .eq("is_published", false)
        .order("created_at", { ascending: false });

      if (data) setAssessments(data);
      setLoading(false);
    }
    loadAssessments();
  }, [supabase]);

  useEffect(() => {
    if (!selectedAssessment) return;

    async function loadStudents() {
      const assessment = assessments.find(a => a.id === selectedAssessment);
      if (!assessment) return;

      const { data: studentList } = await supabase
        .from("student_class_history")
        .select("student_id, students(full_name, admission_number)")
        .eq("class_id", assessment.class_id)
        .eq("is_current", true);

      const { data: existingGrades } = await supabase
        .from("grades")
        .select("student_id, score, remarks")
        .eq("assessment_id", selectedAssessment);

      const gradeMap: any = {};
      existingGrades?.forEach((g: any) => {
        gradeMap[g.student_id] = { score: g.score ?? "", remarks: g.remarks ?? "" };
      });

      if (studentList) {
        const formatted = studentList.map((s: any) => ({
          id: s.student_id,
          name: s.students?.full_name,
          adm: s.students?.admission_number,
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));

        setStudents(formatted);
        
        const initialGrades: any = { ...gradeMap };
        formatted.forEach((s: any) => {
          if (!initialGrades[s.id]) {
            initialGrades[s.id] = { score: "", remarks: "" };
          }
        });
        setGrades(initialGrades);
      }
    }
    loadStudents();
  }, [selectedAssessment, assessments, supabase]);

  const handleGradeChange = (studentId: string, field: "score" | "remarks", value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSave = async (publish = false) => {
    setIsSubmitting(true);
    setMessage(null);

    const assessment = assessments.find(a => a.id === selectedAssessment);
    const payload = {
      assessmentId: selectedAssessment,
      grades: Object.entries(grades).map(([studentId, data]) => ({
        studentId,
        score: data.score === "" ? null : Number(data.score),
        remarks: data.remarks
      }))
    };

    const result = await submitGradesAction(payload);

    if (result.success) {
      if (publish) {
        const pubResult = await publishAssessmentAction(selectedAssessment);
        if (pubResult.success) {
          setMessage({ type: "success", text: "Grades published successfully!" });
          setAssessments(prev => prev.filter(a => a.id !== selectedAssessment));
          setSelectedAssessment("");
        } else {
          setMessage({ type: "error", text: pubResult.message });
        }
      } else {
        setMessage({ type: "success", text: "Grades saved as draft." });
      }
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Loading assessments...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Grade Entry</h1>
        <div className="w-full sm:w-72">
          <select 
            value={selectedAssessment} 
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm min-h-[44px]"
          >
            <option value="">Select Assessment</option>
            {assessments.map(a => (
              <option key={a.id} value={a.id}>
                {a.classes?.name} - {a.subjects?.name} ({a.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {!selectedAssessment ? (
        <EmptyState 
          icon="grades"
          title="No assessment selected"
          description="Select an active assessment from the dropdown to start entering grades."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-500">Student</th>
                  <th className="px-6 py-4 font-medium text-slate-500 w-32">Score</th>
                  <th className="px-6 py-4 font-medium text-slate-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.adm}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={grades[student.id]?.score}
                        onChange={(e) => handleGradeChange(student.id, "score", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={grades[student.id]?.remarks}
                        onChange={(e) => handleGradeChange(student.id, "remarks", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Excellent work"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t bg-slate-50 flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md text-sm font-medium border bg-white hover:bg-slate-100 flex items-center gap-2 min-h-[44px]"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md text-sm font-medium bg-primary-800 text-white hover:bg-primary-700 flex items-center gap-2 min-h-[44px]"
            >
              <Send className="h-4 w-4" />
              Publish Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
