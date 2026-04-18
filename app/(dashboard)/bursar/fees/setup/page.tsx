import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus } from "lucide-react";
import { FeeSetupClient } from "@/components/forms/fee-setup-client";

export default async function FeeSetupPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("*")
    .eq("school_id", profile?.school_id)
    .eq("status", "active")
    .single();

  const { data: feeTypes } = await supabase
    .from("fee_types")
    .select("*")
    .eq("school_id", profile?.school_id);

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
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

      {!activeTerm ? (
        <EmptyState 
            icon="reports"
            title="No Active Term"
            description="You must have an active term to set up and assign school fees."
            actionLabel="Manage Calendar"
            actionHref="/admin/settings/academic-year"
        />
      ) : !feeTypes || feeTypes.length === 0 ? (
        <EmptyState 
          icon="fees"
          title="No fee types found"
          description="You must create fee types (e.g., 'Tuition', 'PTA') before assigning them."
        />
      ) : (
        <FeeSetupClient 
            feeTypes={feeTypes} 
            classes={classes || []} 
            activeTerm={activeTerm} 
        />
      )}
    </div>
  );
}
