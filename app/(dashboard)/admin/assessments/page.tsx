"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAssessmentAction, publishAssessmentAction } from "@/actions/grade-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { format } from "date-fns";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";

export default function AdminAssessmentsPage() {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subjectId: "",
    assessmentTypeId: "",
    date: new Date().toISOString().split("T")[0],
    maxScore: 100
  });

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single();
    
    if (profile?.school_id) {
      const [assessRes, classesRes, subjectsRes, typesRes] = await Promise.all([
        supabase.from("assessments").select("*, classes(name), subjects(name), assessment_types(name)").eq("classes.school_id", profile.school_id).order("date", { ascending: false }),
        supabase.from("classes").select("id, name").eq("school_id", profile.school_id).order("level"),
        supabase.from("subjects").select("id, name").eq("school_id", profile.school_id),
        supabase.from("assessment_types").select("id, name").eq("school_id", profile.school_id)
      ]);
      
      setAssessments(assessRes.data || []);
      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setTypes(typesRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Get current active term
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single();
    const { data: term } = await supabase.from("terms").select("id").eq("school_id", profile.school_id).eq("status", "active").single();
    
    if (!term) {
      alert("No active term found. Please open a term first.");
      return;
    }

    const res = await createAssessmentAction({
      ...formData,
      termId: term.id
    });

    if (res.success) {
      setShowModal(false);
      loadData();
    } else {
      alert(res.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading assessments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
          <p className="text-sm text-slate-500">Manage exams, tests and coursework for the current term.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Assessment
        </button>
      </div>

      {assessments.length === 0 ? (
        <EmptyState 
          icon="grades"
          title="No assessments created"
          description="Create your first assessment to start recording student grades."
          actionLabel="Create Assessment"
          actionHref="#"
        />
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Class/Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{a.title}</td>
                    <td className="px-6 py-4">
                      <p>{a.classes?.name}</p>
                      <p className="text-xs text-slate-500">{a.subjects?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(a.date), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4">
                      {a.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!a.is_published && (
                          <button 
                            onClick={async () => {
                              await publishAssessmentAction(a.id);
                              loadData();
                            }}
                            className="text-primary-600 hover:underline font-medium"
                          >
                            Publish
                          </button>
                        )}
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-slate-800">Create Assessment</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="e.g. Mid-Term Math Test"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select 
                    required
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select 
                    required
                    value={formData.subjectId}
                    onChange={e => setFormData({...formData, subjectId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assessment Type</label>
                  <select 
                    required
                    value={formData.assessmentTypeId}
                    onChange={e => setFormData({...formData, assessmentTypeId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Score</label>
                  <input 
                    type="number"
                    required
                    value={formData.maxScore}
                    onChange={e => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Date</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
