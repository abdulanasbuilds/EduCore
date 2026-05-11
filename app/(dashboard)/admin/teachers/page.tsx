"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Mail, Phone, Edit2, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

type Teacher = {
  id: string; full_name: string; email: string | null; phone: string | null;
  whatsapp_number: string | null; role: string; avatar_url: string | null;
};

export default function TeachersPage() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", whatsapp: "", role: "class_teacher" as "class_teacher" | "subject_teacher" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createClient() as any;

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
    if (!profile) { setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, whatsapp_number, role, avatar_url")
      .eq("school_id", profile.school_id)
      .in("role", ["class_teacher", "subject_teacher"])
      .order("full_name");
    setTeachers(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient() as any;
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) { setMsg({ success: false, message: "No school found" }); setSaving(false); return; }

      const { error } = await supabase.from("profiles").insert({
        school_id: profile.school_id,
        full_name: formData.fullName,
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp_number: formData.whatsapp || null,
        role: formData.role,
      } as any);

      if (error) { setMsg({ success: false, message: error.message }); }
      else {
        setMsg({ success: true, message: "Teacher added successfully" });
        setModalOpen(false);
        setFormData({ fullName: "", email: "", phone: "", whatsapp: "", role: "class_teacher" });
        loadTeachers();
      }
    } catch (err: any) { setMsg({ success: false, message: err.message }); }
    setSaving(false);
  };

  const filtered = teachers.filter((t: any) =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
          <p className="text-sm text-slate-500">{teachers.length} teaching staff</p>
        </div>
        <button onClick={() => { setModalOpen(true); setMsg(null); }} className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>

      {msg && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${msg.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.message}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center"><EmptyState icon="grades" title="No teachers found" description={search ? "No teachers match your search." : "No teachers have been added yet."} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-600">Name</th>
                  <th className="px-6 py-4 font-medium text-slate-600">Role</th>
                  <th className="px-6 py-4 font-medium text-slate-600">Email</th>
                  <th className="px-6 py-4 font-medium text-slate-600">Phone</th>
                  <th className="px-6 py-4 font-medium text-slate-600">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr key={t.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{t.full_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">{t.role.replace("_", " ")}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.email ? <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t.email}</span> : "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{t.phone || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{t.whatsapp_number || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Teacher</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                  <input value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="class_teacher">Class Teacher</option>
                  <option value="subject_teacher">Subject Teacher</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-800 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Adding..." : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
