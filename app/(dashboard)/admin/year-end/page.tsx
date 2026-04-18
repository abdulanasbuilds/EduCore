import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Download } from "lucide-react";

export default async function YearEndPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: year } = await supabase
    .from("academic_years")
    .select("*")
    .eq("school_id", profile?.school_id)
    .eq("is_current", true)
    .single();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Year-End Processing</h1>
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-amber-900 mb-2">Year-End Checklist</h2>
          <p className="text-amber-800 text-sm mb-4">You are about to close the academic year {year?.name}. Ensure the following:</p>
          <ul className="list-disc pl-5 space-y-1 text-amber-800 text-sm">
              <li>All terms are closed and locked</li>
              <li>All grades have been entered and published</li>
              <li>All fee payments have been reconciled</li>
          </ul>
      </div>
      <EmptyState 
        icon="reports"
        title="Promotions Suggester"
        description="System analysis of student performance to suggest promotions will appear here."
      />
    </div>
  );
}
