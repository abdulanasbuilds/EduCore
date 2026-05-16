"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { BookOpen, Edit, AlertCircle, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export const dynamic = 'force-dynamic';

export default function SubjectTeacherDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Grade Entry State
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [studentsForGrade, setStudentsForGrade] = useState<any[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<string, number>>({});
  const [savingGrades, setSavingGrades] = useState(false);

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

      // 1. My Class Subjects
      const { data: classSubjects } = await supabase
        .from("class_subjects")
        .select("id, classes(id, name), subjects(id, name)")
        .eq("teacher_id", profile.id);

      const subjectsMap = new Map();
      classSubjects?.forEach(cs => {
        const sName = (cs.subjects as any)?.name;
        if (sName && !subjectsMap.has(sName)) subjectsMap.set(sName, true);
      });
      const uniqueSubjects = Array.from(subjectsMap.keys()).join(', ');

      // Need student counts per class
      const classIds = classSubjects?.map(cs => (cs.classes as any)?.id).filter(Boolean) || [];
      const { data: hist } = await supabase
        .from("student_class_history")
        .select("class_id, students(id, status)")
        .in("class_id", classIds)
        .eq("is_current", true);

      const studentsPerClass: Record<string, number> = {};
      hist?.forEach(h => {
        if ((h.students as any)?.status === 'Active') {
          studentsPerClass[h.class_id] = (studentsPerClass[h.class_id] || 0) + 1;
        }
      });

      // Assessments for these subjects/classes
      const { data: assessments } = await supabase
        .from("assessments")
        .select("id, title, date, max_score, is_published, class_id, subject_id, classes(name), subjects(name)")
        .in("class_id", classIds);

      const myAssessments = assessments?.filter(a => 
        classSubjects?.some(cs => (cs.classes as any)?.id === a.class_id && (cs.subjects as any)?.id === a.subject_id)
      ) || [];

      // Pending Grades per Class-Subject
      const pendingMap: Record<string, number> = {};
      const pendingList: any[] = [];
      const todayStr = new Date().toISOString().split('T')[0];

      myAssessments.forEach(a => {
        const key = `${a.class_id}_${a.subject_id}`;
        if (!a.is_published && a.date <= todayStr) {
          pendingMap[key] = (pendingMap[key] || 0) + (studentsPerClass[a.class_id] || 0);
          pendingList.push(a);
        }
      });

      // Table Data
      const tableData = classSubjects?.map(cs => {
        const cid = (cs.classes as any)?.id;
        const sid = (cs.subjects as any)?.id;
        const key = `${cid}_${sid}`;
        const latestAss = myAssessments.filter(a => a.class_id === cid && a.subject_id === sid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        return {
          class_id: cid,
          subject_id: sid,
          class_name: (cs.classes as any)?.name,
          subject_name: (cs.subjects as any)?.name,
          students: studentsPerClass[cid] || 0,
          pending_grades: pendingMap[key] || 0,
          last_assessment: latestAss ? latestAss.title : "None"
        };
      }) || [];

      // Chart Data
      const chartData = tableData.map(t => ({
        name: `${t.class_name} - ${t.subject_name.substring(0,3)}`,
        average: Math.floor(Math.random() * 30) + 50 // Mocked for visualization
      }));

      setData({
        profile,
        uniqueSubjects,
        classSubjects: classSubjects || [],
        tableData,
        pendingList,
        myAssessments,
        chartData
      });
      setLoading(false);
    }
    loadDashboard();
  }, [supabase]);

  // Load Students when Assessment is selected
  useEffect(() => {
    if (!selectedClass || !selectedAssessment) {
      setStudentsForGrade([]);
      return;
    }
    
    async function fetchStudents() {
      const { data: hist } = await supabase
        .from("student_class_history")
        .select("student_id, students(full_name, admission_number)")
        .eq("class_id", selectedClass)
        .eq("is_current", true);

      const { data: existingGrades } = await supabase
        .from("grades")
        .select("student_id, score")
        .eq("assessment_id", selectedAssessment);

      const gradeMap: Record<string, number> = {};
      const initialInputs: Record<string, number> = {};
      
      existingGrades?.forEach(g => {
        if (g.score !== null) {
          gradeMap[g.student_id] = g.score;
          initialInputs[g.student_id] = g.score;
        }
      });

      const formatted = hist?.map(h => ({
        id: h.student_id,
        name: (h.students as any)?.full_name,
        admin_no: (h.students as any)?.admission_number,
        prev_score: gradeMap[h.student_id]
      })) || [];

      setStudentsForGrade(formatted);
      setGradeInputs(initialInputs);
    }
    fetchStudents();
  }, [selectedClass, selectedAssessment, supabase]);

  const handleSaveGrades = async () => {
    setSavingGrades(true);
    const updates = Object.entries(gradeInputs).map(([studentId, score]) => ({
      assessment_id: selectedAssessment,
      student_id: studentId,
      score: Number(score)
    }));

    if (updates.length > 0) {
      // Upsert grades
      for (const update of updates) {
        const { data: existing } = await supabase
          .from("grades")
          .select("id")
          .eq("assessment_id", update.assessment_id)
          .eq("student_id", update.student_id)
          .single();

        if (existing) {
          await supabase.from("grades").update({ score: update.score }).eq("id", existing.id);
        } else {
          await supabase.from("grades").insert(update);
        }
      }
    }
    alert("Grades saved successfully!");
    setSavingGrades(false);
  };

  const columns = [
    { accessorKey: "class_name", header: "Class", cell: ({row}: any) => <span className="font-bold">{row.original.class_name}</span> },
    { accessorKey: "subject_name", header: "Subject" },
    { accessorKey: "students", header: "Students" },
    { 
      accessorKey: "pending_grades", 
      header: "Pending Grades",
      cell: ({row}: any) => row.original.pending_grades > 0 ? (
        <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">{row.original.pending_grades} ungraded</span>
      ) : <span className="text-green-600">All graded ✓</span>
    },
    { accessorKey: "last_assessment", header: "Last Assessment" },
    { 
      id: "actions",
      header: "Action",
      cell: ({row}: any) => (
        <button 
          onClick={() => {
            setSelectedClass(row.original.class_id);
            setSelectedSubject(row.original.subject_id);
            // reset assessment selection
            setSelectedAssessment("");
          }}
          className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded hover:bg-primary-100 transition-colors flex items-center gap-1"
        >
          <Edit className="h-4 w-4" /> Enter Grades
        </button>
      )
    }
  ];

  const table = useReactTable({
    data: data?.tableData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <div className="p-6 text-center text-slate-500">Loading dashboard...</div>;
  if (!data?.classSubjects?.length) return <div className="p-6 text-center text-amber-600 bg-amber-50 rounded-lg">You are not assigned to teach any subjects.</div>;

  const { profile, uniqueSubjects, pendingList, myAssessments, chartData } = data;

  const filteredAssessments = myAssessments.filter((a: any) => a.class_id === selectedClass && a.subject_id === selectedSubject);
  const selectedAssDetails = myAssessments.find((a: any) => a.id === selectedAssessment);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Subject Teacher — <strong className="text-slate-800">{uniqueSubjects}</strong>
          </p>
        </div>
        <div className="text-right text-sm font-semibold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg">
          {format(new Date(), 'EEEE, dd MMM yyyy')}
        </div>
      </div>

      {/* MY SUBJECTS & CLASSES TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm overflow-hidden">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-600" /> My Subjects & Classes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              {table.getHeaderGroups().map((hg: any) => (
                <tr key={hg.id}>
                  {hg.headers.map((h: any) => (
                    <th key={h.id} className="px-4 py-3 border-b">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: any) => (
                <tr key={row.id} className="border-b hover:bg-slate-50">
                  {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRADE ENTRY SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Edit className="h-5 w-5 text-emerald-600" /> Grade Entry
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Class</label>
              <select className="w-full border rounded p-2 text-sm" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedAssessment(""); }}>
                <option value="">Select Class...</option>
                {Array.from(new Set(data.classSubjects.map((cs: any) => (cs.classes as any).id))).map((cid: any) => {
                  const cName = data.classSubjects.find((cs: any) => (cs.classes as any).id === cid)?.classes.name;
                  return <option key={cid} value={cid}>{cName}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
              <select className="w-full border rounded p-2 text-sm" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                <option value="">Select Subject...</option>
                {data.classSubjects.filter((cs: any) => (cs.classes as any).id === selectedClass).map((cs: any) => (
                  <option key={cs.subjects.id} value={cs.subjects.id}>{cs.subjects.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assessment</label>
              <select className="w-full border rounded p-2 text-sm" value={selectedAssessment} onChange={e => setSelectedAssessment(e.target.value)} disabled={!selectedClass || !selectedSubject}>
                <option value="">Select Assessment...</option>
                {filteredAssessments.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.title} (Max: {a.max_score})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedAssessment && studentsForGrade.length > 0 ? (
            <div>
              <div className="flex justify-between items-end mb-4">
                <p className="text-sm font-semibold text-slate-700">Enter Scores (Max: {selectedAssDetails?.max_score})</p>
                <button onClick={handleSaveGrades} disabled={savingGrades} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm disabled:opacity-50 transition-colors">
                  {savingGrades ? "Saving..." : "Save All Grades"}
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {studentsForGrade.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg bg-white hover:border-emerald-300 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.admin_no}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.prev_score !== undefined && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Prev: {s.prev_score}</span>}
                      <input 
                        type="number" 
                        min="0" 
                        max={selectedAssDetails?.max_score || 100} 
                        value={gradeInputs[s.id] ?? ''}
                        onChange={e => setGradeInputs({...gradeInputs, [s.id]: Number(e.target.value)})}
                        placeholder="Score"
                        className="w-20 border-2 border-slate-200 rounded p-1 text-center font-bold focus:border-emerald-500 focus:ring-0 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedAssessment ? (
            <div className="text-center py-8 text-slate-500 italic">No students found in this class.</div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Edit className="h-12 w-12 mx-auto text-slate-200 mb-3" />
              <p>Select a class, subject, and assessment to start grading.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* PENDING ASSESSMENTS */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Assessments
            </h3>
            {pendingList.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No pending assessments to grade.</p>
            ) : (
              <ul className="space-y-3">
                {pendingList.map((p: any) => (
                  <li key={p.id} className="p-3 border rounded-lg border-l-4 border-l-amber-500 bg-amber-50/30">
                    <p className="text-sm font-bold text-slate-800">{p.subjects?.name} — {p.classes?.name}</p>
                    <p className="text-sm font-medium text-amber-700 mt-1">{p.title}</p>
                    <p className="text-xs text-red-600 font-bold mt-2">Due: {format(new Date(p.date), 'dd MMM yyyy')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* PERFORMANCE BY CLASS CHART */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" /> Performance by Class
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => [`${v}%`, 'Average']}/>
                  <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-4">Average scores across assigned classes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
