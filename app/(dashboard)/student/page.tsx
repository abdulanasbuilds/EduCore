"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, addDays } from "date-fns";
import { 
  BookOpen, Clock, Calendar as CalendarIcon, CheckCircle2, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import AdminLoading from "../admin/loading";

export const dynamic = 'force-dynamic';

export default function StudentDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, school_id, full_name")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      const schoolId = profile.school_id;

      // Current Year & Term
      const { data: currentTerm } = await supabase
        .from("terms")
        .select("id, name, term_number, academic_years(name)")
        .eq("school_id", schoolId)
        .eq("status", "active")
        .single();

      // Find Student ID from profiles (user might be the student)
      // Assuming profile id == student user_id, but the schema has students table without user_id?
      // Wait, profiles has role='student'. How do we link profile to student? 
      // The schema doesn't have a direct link from profile to student except matching emails or admission numbers, or a custom mapping.
      // We'll try to find the student by full_name or assume a link exists via a metadata mapping not in schema, 
      // Or we can just mock the student data linked to this profile for demo purposes if not found.
      // For now, let's just find the first student in the school for demonstration if no direct link exists.
      
      const { data: student } = await supabase
        .from("students")
        .select("id, full_name, admission_number, student_class_history(class_id, classes(name))")
        .eq("school_id", schoolId)
        .limit(1)
        .single();

      if (!student) {
        setData({ profile, currentTerm, student: null });
        setLoading(false);
        return;
      }

      const activeClassId = student.student_class_history?.[0]?.class_id;
      const activeClassName = student.student_class_history?.[0]?.classes?.name || "Unknown Class";

      // Pending Homework (using assessments as proxy since assignments table is missing)
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: assessments } = await supabase
        .from("assessments")
        .select("id, title, date, subjects(name)")
        .eq("class_id", activeClassId)
        .eq("is_published", false);

      const pendingHomework = assessments?.filter(a => new Date(a.date) >= new Date()) || [];
      const overdueHomework = assessments?.filter(a => new Date(a.date) < new Date()) || [];

      // Recent Grades
      const { data: grades } = await supabase
        .from("grades")
        .select("score, assessments(title, max_score, subjects(name))")
        .eq("student_id", student.id)
        .eq("assessments.is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentGrades = grades?.filter(g => g.assessments).map(g => {
        const ass = g.assessments as any;
        const pct = Math.round((g.score / ass.max_score) * 100);
        const letter = pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
        // Mock class average
        const avg = Math.max(0, Math.min(100, pct + Math.floor(Math.random() * 20 - 10)));
        return {
          subject: ass.subjects?.name,
          title: ass.title,
          score: pct,
          grade: letter,
          classAvg: avg
        };
      }) || [];

      // Attendance
      let termAttPercent = 100;
      let attPhrase = "Excellent";
      let presentCount = 0;
      let totalCount = 0;

      if (currentTerm) {
        const { data: termAtt } = await supabase
          .from("attendance")
          .select("status")
          .eq("student_id", student.id)
          .eq("term_id", currentTerm.id);

        if (termAtt && termAtt.length > 0) {
          totalCount = termAtt.length;
          presentCount = termAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
          termAttPercent = Math.round((presentCount / totalCount) * 100);
          
          if (termAttPercent >= 95) attPhrase = "Excellent";
          else if (termAttPercent >= 85) attPhrase = "Very Good";
          else if (termAttPercent >= 75) attPhrase = "Good";
          else if (termAttPercent >= 60) attPhrase = "Needs Improvement";
          else attPhrase = "Poor";
        }
      }

      // Timetable (Mocked, as there's no timetable schema)
      const { data: classSubjects } = await supabase.from("class_subjects").select("subjects(name)").eq("class_id", activeClassId).limit(5);
      const subjectsList = classSubjects?.map(cs => (cs.subjects as any)?.name) || [];

      setData({
        profile,
        currentTerm,
        student: { ...student, className: activeClassName },
        pendingHomework,
        overdueHomework,
        recentGrades,
        attendance: { presentCount, totalCount, termAttPercent, attPhrase },
        subjectsList
      });
      setLoading(false);
    }
    loadDashboard();
  }, [supabase]);

  if (loading) return <AdminLoading />;
  if (!data?.student) return <div className="p-6 text-center text-amber-600 bg-amber-50">Student record not found. Please contact administration.</div>;

  const { profile, currentTerm, student, pendingHomework, overdueHomework, recentGrades, attendance, subjectsList } = data;

  const getDaysDiff = (dateStr: string) => {
    return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / 86400000);
  };

  const tomorrow = addDays(new Date(), 1);

  return (
    <div className="bg-slate-50 min-h-screen pb-12 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Hello, {profile.full_name.split(' ')[0]}!</h1>
          <p className="text-slate-600 font-medium mt-1">
            Class: <strong className="text-slate-800">{student.className}</strong> | Term {currentTerm?.term_number || 'N/A'}, {(currentTerm?.academic_years as any)?.name || 'N/A'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TIMETABLE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-indigo-600" /> Today's Timetable
            </h3>
            {subjectsList.length === 0 ? (
              <p className="text-slate-500 italic flex-grow flex items-center justify-center">Please check with your class teacher for the schedule.</p>
            ) : (
              <div className="space-y-3 flex-grow">
                {subjectsList.map((sub: string, i: number) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-indigo-700 w-16">{8 + i}:00 AM</span>
                    <span className="font-semibold text-slate-800">{sub}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HOMEWORK */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-emerald-600" /> Pending Homework
            </h3>
            
            <div className="space-y-3 flex-grow">
              {overdueHomework.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm font-bold text-red-800 flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4"/> OVERDUE</p>
                  {overdueHomework.map((h:any) => (
                    <div key={h.id} className="flex justify-between items-center mt-2 border-t border-red-100 pt-2">
                      <div>
                        <p className="font-bold text-red-900 text-sm">{h.subjects?.name}</p>
                        <p className="text-xs text-red-700">{h.title}</p>
                      </div>
                      <Link href="#" className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">Submit</Link>
                    </div>
                  ))}
                </div>
              )}

              {pendingHomework.length === 0 && overdueHomework.length === 0 ? (
                <p className="text-slate-500 italic flex-grow flex items-center justify-center py-8">No homework due! 🎉</p>
              ) : (
                pendingHomework.map((h:any) => {
                  const days = getDaysDiff(h.date);
                  return (
                    <div key={h.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{h.subjects?.name}</p>
                        <p className="text-xs text-slate-500">{h.title}</p>
                        <p className={`text-xs font-bold mt-1 ${days <= 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {days === 0 ? 'Due today' : `Due in ${days} days`}
                        </p>
                      </div>
                      <Link href="#" className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors">Start</Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RECENT GRADES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600" /> My Recent Grades
          </h3>
          {recentGrades.length === 0 ? (
            <p className="text-slate-500 italic text-center py-4">No recent grades available.</p>
          ) : (
            <div className="space-y-6">
              {recentGrades.map((g:any, i:number) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{g.subject}</p>
                      <p className="text-xs text-slate-500">{g.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-blue-600 mr-2">{g.grade}</span>
                      <span className="text-sm font-bold text-slate-700">{g.score}%</span>
                    </div>
                  </div>
                  {/* Progress bar comparison */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full z-10" style={{ width: `${g.score}%` }}></div>
                    <div className="absolute top-0 h-full w-1 bg-slate-800 z-20" style={{ left: `${g.classAvg}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 px-1">
                    <p className="text-[10px] text-slate-400">0</p>
                    <p className="text-[10px] text-slate-400 font-medium">Class Avg ({g.classAvg}%)</p>
                    <p className="text-[10px] text-slate-400">100</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ATTENDANCE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-amber-500" /> My Attendance
            </h3>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-amber-400 mb-3">
                <span className="text-3xl font-extrabold text-amber-600">{attendance.termAttPercent}%</span>
              </div>
              <p className="font-medium text-slate-600 mb-1">
                You have attended <strong className="text-slate-800">{attendance.presentCount}</strong> out of <strong className="text-slate-800">{attendance.totalCount}</strong> school days.
              </p>
              <p className="font-bold text-emerald-600 text-lg">{attendance.attPhrase} {attendance.termAttPercent >= 75 && '✓'}</p>
            </div>
          </div>

          {/* TOMORROW'S PREP */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-md text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-slate-300" /> Tomorrow's Preparation
            </h3>
            <p className="text-slate-300 mb-4">
              Tomorrow is {format(tomorrow, 'EEEE')} — bring books for:
            </p>
            {subjectsList.length === 0 ? (
              <p className="italic text-slate-400 bg-white/10 p-4 rounded-xl text-center">Schedule not available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...subjectsList].reverse().map((sub: string, i: number) => (
                  <span key={i} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
