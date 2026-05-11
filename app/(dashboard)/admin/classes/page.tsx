"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Edit2, Trash2, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClassAction, updateClassAction, deleteClassAction } from "@/actions/class-actions";
import { createSubjectAction, allocateSubjectToClassAction, removeSubjectFromClassAction } from "@/actions/class-actions";
import { useRouter } from "next/navigation";

type Class = { id: string; name: string; level: number; capacity: number; class_teacher_id: string | null; profiles?: { full_name: string } };
type Subject = { id: string; name: string; code: string; type: string };
type Teacher = { id: string; full_name: string; role: string };
type ClassSubject = { subject_id: string; subjects: { id: string; name: string; code: string } };

export default function ClassesPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classSubjects, setClassSubjects] = useState<Record<string, ClassSubject[]>>({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("classes");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [allocClassId, setAllocClassId] = useState("");
  const [formData, setFormData] = useState({ name: "", level: "", capacity: "40", classTeacherId: "", description: "" });
  const [subjForm, setSubjForm] = useState({ name: "", code: "", type: "Core" as "Core" | "Elective" | "Optional" });
  const [allocSubjectId, setAllocSubjectId] = useState("");
  const [allocTeacherId, setAllocTeacherId] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createClient() as any;
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) { setLoading(false); return; }

      const [{ data: cls }, { data: sub }, { data: tch }] = await Promise.all([
        supabase.from("classes").select("id, name, level, capacity, class_teacher_id, profiles(full_name)").eq("school_id", profile.school_id).order("level"),
        supabase.from("subjects").select("id, name, code, type").eq("school_id", profile.school_id).order("name"),
        supabase.from("profiles").select("id, full_name, role").eq("school_id", profile.school_id).in("role", ["class_teacher", "subject_teacher"]).order("full_name"),
      ]);

      setClasses(cls || []);
      setSubjects(sub || []);
      setTeachers(tch || []);

      if (cls?.length) {
        const csMap: Record<string, ClassSubject[]> = {};
        for (const c of cls) {
          const { data: cs } = await supabase
            .from("class_subjects").select("subject_id, subjects(id, name, code)")
            .eq("class_id", c.id);
          csMap[c.id] = cs || [];
        }
        setClassSubjects(csMap);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = classes.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditingClass(null);
    setFormData({ name: "", level: "", capacity: "40", classTeacherId: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, level: String(cls.level), capacity: String(cls.capacity), classTeacherId: cls.class_teacher_id || "", description: "" });
    setModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = editingClass
      ? await updateClassAction(editingClass.id, { name: formData.name, level: parseInt(formData.level), capacity: parseInt(formData.capacity), classTeacherId: formData.classTeacherId || undefined, description: formData.description })
      : await createClassAction({ name: formData.name, level: parseInt(formData.level), capacity: parseInt(formData.capacity), classTeacherId: formData.classTeacherId || undefined, description: formData.description });
    setMsg(result);
    if (result.success) {
      setModalOpen(false);
      router.refresh();
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      const { data: cls } = await supabase.from("classes").select("id, name, level, capacity, class_teacher_id, profiles(full_name)").eq("school_id", profile?.school_id).order("level");
      setClasses(cls || []);
    }
    setSaving(false);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    const res = await deleteClassAction(id);
    setMsg(res);
    if (res.success) {
      router.refresh();
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      const { data: cls } = await supabase.from("classes").select("id, name, level, capacity, class_teacher_id, profiles(full_name)").eq("school_id", profile?.school_id).order("level");
      setClasses(cls || []);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createSubjectAction(subjForm);
    setMsg(res);
    if (res.success) {
      setSubjectModalOpen(false);
      setSubjForm({ name: "", code: "", type: "Core" });
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      const { data: sub } = await supabase.from("subjects").select("id, name, code, type").eq("school_id", profile?.school_id).order("name");
      setSubjects(sub || []);
    }
    setSaving(false);
  };

  const openAllocation = (classId: string) => {
    setAllocClassId(classId);
    setAllocSubjectId("");
    setAllocTeacherId("");
    setAllocModalOpen(true);
  };

  const handleAllocSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await allocateSubjectToClassAction(allocClassId, allocSubjectId, allocTeacherId || undefined);
    setMsg(res);
    if (res.success) {
      setAllocModalOpen(false);
      const { data: cs } = await supabase.from("class_subjects").select("subject_id, subjects(id, name, code)").eq("class_id", allocClassId);
      setClassSubjects(prev => ({ ...prev, [allocClassId]: cs || [] }));
    }
    setSaving(false);
  };

  const handleRemoveSubject = async (classId: string, subjectId: string) => {
    if (!confirm("Remove this subject from class?")) return;
    const res = await removeSubjectFromClassAction(classId, subjectId);
    setMsg(res);
    if (res.success) {
      setClassSubjects(prev => ({
        ...prev,
        [classId]: (prev[classId] || []).filter(cs => cs.subject_id !== subjectId),
      }));
    }
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes & Subjects</h1>
          <p className="text-sm text-slate-500">{classes.length} classes &middot; {subjects.length} subjects</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${msg.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.message}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
          <TabsTrigger value="subjects">Subjects ({subjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-4 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <button onClick={openCreate} className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary-700">
              <Plus className="h-4 w-4" /> Add Class
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="grades" title="No classes found" description={search ? "No classes match your search." : "No classes have been set up yet."} />
          ) : (
            <div className="space-y-4">
              {filtered.map((c: any) => (
                <div key={c.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{c.name}</h3>
                        <p className="text-sm text-slate-500">Level {c.level} &middot; Capacity: {c.capacity} &middot; Class Teacher: {c.profiles?.full_name || "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openAllocation(c.id)} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> Subjects
                      </button>
                      <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteClass(c.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {(classSubjects[c.id] || []).length === 0 ? (
                      <span className="text-sm text-slate-400">No subjects assigned — <button onClick={() => openAllocation(c.id)} className="text-indigo-600 hover:underline">assign subjects</button></span>
                    ) : (
                      (classSubjects[c.id] || []).map(cs => (
                        <span key={cs.subject_id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {cs.subjects?.name || "—"}
                          <button onClick={() => handleRemoveSubject(c.id, cs.subject_id)} className="hover:text-red-600 ml-1"><X className="h-3 w-3" /></button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">Manage subjects offered by the school.</p>
            <button onClick={() => setSubjectModalOpen(true)} className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary-700">
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>
          {subjects.length === 0 ? (
            <EmptyState icon="grades" title="No subjects" description="Add subjects to assign them to classes." />
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-slate-600">Code</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-600">Subject Name</th>
                    <th className="px-6 py-4 text-left font-medium text-slate-600">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(s => (
                    <tr key={s.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-600">{s.code}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.type === "Core" ? "bg-blue-100 text-blue-700" : s.type === "Elective" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{s.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Class Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingClass ? "Edit Class" : "Add New Class"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Primary 1" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level (1-15)</label>
                  <input required type="number" min="1" max="15" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                  <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Teacher</label>
                <select value={formData.classTeacherId} onChange={e => setFormData({ ...formData, classTeacherId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.role.replace("_", " ")})</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                  {saving ? "Saving..." : editingClass ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Create Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Subject</h2>
              <button onClick={() => setSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                <input required value={subjForm.name} onChange={e => setSubjForm({ ...subjForm, name: e.target.value })} placeholder="e.g. Mathematics" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                  <input required value={subjForm.code} onChange={e => setSubjForm({ ...subjForm, code: e.target.value })} placeholder="MATH" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={subjForm.type} onChange={e => setSubjForm({ ...subjForm, type: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSubjectModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Allocation Modal */}
      {allocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Assign Subject to Class</h2>
              <button onClick={() => setAllocModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAllocSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select required value={allocSubjectId} onChange={e => setAllocSubjectId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Teacher <span className="text-slate-400">(optional)</span></label>
                <select value={allocTeacherId} onChange={e => setAllocTeacherId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAllocModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                  {saving ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}