import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Save } from "lucide-react";
import Link from "next/link";

export default async function FeeSetupPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id, name")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const { data: feeTypes } = await supabase
    .from("fee_types")
    .select("id, name, description")
    .eq("school_id", profile?.school_id);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, level")
    .eq("school_id", profile?.school_id)
    .order("level");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Assignment Setup</h1>
          <p className="text-sm text-slate-500">Configure fees for {activeTerm?.name || "Active Term"}</p>
        </div>
        <button className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]">
          <Plus className="h-4 w-4" />
          Create Fee Type
        </button>
      </div>

      {!feeTypes || feeTypes.length === 0 ? (
        <EmptyState 
          icon="fees"
          title="No fee types found"
          description="You must create fee types (e.g., 'Tuition', 'PTA') before assigning them."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-semibold text-slate-800 text-lg">Assign Fees to Classes</h3>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 min-h-[44px]">
              <Save className="h-4 w-4" />
              Save Assignments
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 border-r">Class</th>
                  {feeTypes.map((ft: any) => (
                    <th key={ft.id} className="px-4 py-3 min-w-[120px] text-center border-r">
                      {ft.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 min-w-[150px]">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {classes?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 border-r">{c.name}</td>
                    {feeTypes.map((ft: any) => (
                      <td key={ft.id} className="px-4 py-3 border-r">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₵</span>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="pl-8 pr-3 py-1.5 border rounded text-sm w-full outline-none focus:border-primary-500"
                          />
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <input 
                        type="date" 
                        className="px-3 py-1.5 border rounded text-sm w-full outline-none focus:border-primary-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm border border-amber-200">
            <strong>Warning:</strong> Saving assignments will automatically assign these fees to all active students in the respective classes. This action creates immutable fee records.
          </div>
        </div>
      )}
    </div>
  );
}
