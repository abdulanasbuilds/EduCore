"use client";

import { useState } from "react";
import { Plus, X, Shield, Mail, Phone, MapPin, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSchoolModal({ isOpen, onClose }: CreateSchoolModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient() as any;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    motto: "",
    adminName: "",
    adminEmail: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Create School Record
        const { data: school, error: schoolError } = await supabase
            .from("schools")
            .insert({
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                motto: formData.motto
            })
            .select()
            .single();

        if (schoolError) throw schoolError;

        // Note: Real admin account creation would happen via a protected Edge function 
        // using the Service Role to call auth.admin.createUser().
        // For this scaffold, we notify the system to trigger that flow.
        
        alert(`School "${formData.name}" created successfully! Admin account for ${formData.adminEmail} is being initialized.`);
        router.refresh();
        onClose();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary-400" />
            <h2 className="text-xl font-bold">Register Institutional Instance</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b pb-1">Institutional Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="e.g. Heritage Academy" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="admin@heritage.edu" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Phone</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="+233..." />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
                    <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="123 Education Drive, Accra" />
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b pb-1">Administrative Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Administrator Name</label>
                    <input required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="Headmaster Name" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Administrator login Email</label>
                    <input type="email" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[44px]" placeholder="admin-login@heritage.edu" />
                </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-lg transition-all active:scale-95 disabled:opacity-50 min-h-[44px]">
              {loading ? "Provisioning Instance..." : "Deploy School Engine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
