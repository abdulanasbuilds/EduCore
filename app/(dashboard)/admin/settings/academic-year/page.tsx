import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Check, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AcademicYearPage() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user?.id).single();

  const { data: years } = await supabase
    .from("academic_years")
    .select("*, terms(*)")
    .eq("school_id", profile?.school_id)
    .order("start_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Calendar</h1>
          <p className="text-sm text-slate-500">Manage school years, terms, and holidays</p>
        </div>
        <button className="bg-primary-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center gap-2 min-h-[44px]">
          <Plus className="h-4 w-4" />
          Create New Year
        </button>
      </div>

      {!years || years.length === 0 ? (
        <EmptyState 
          icon="reports"
          title="No Academic Years"
          description="Start by creating the first academic year to configure terms and start classes."
        />
      ) : (
        <div className="space-y-6">
          {years.map((year: any) => (
            <div key={year.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${year.is_current ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}>
              <div className={`p-6 border-b flex justify-between items-center ${year.is_current ? 'bg-primary-50' : 'bg-slate-50'}`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">{year.name}</h2>
                    {year.is_current && (
                      <span className="bg-primary-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Current Year</span>
                    )}
                    {year.status === "closed" && (
                      <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Closed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {format(new Date(year.start_date), "MMM d, yyyy")} - {format(new Date(year.end_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-3">
                  {!year.is_current && year.status !== "closed" && (
                    <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border px-4 py-2 rounded-md shadow-sm">
                      Set as Current
                    </button>
                  )}
                  {year.is_current && (
                    <Link href="/admin/year-end" className="text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-md shadow-sm">
                      Initiate Year-End Processing
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-400" /> Academic Terms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {year.terms?.sort((a: any, b: any) => a.term_number - b.term_number).map((term: any) => (
                    <div key={term.id} className={`p-4 rounded-lg border ${
                      term.status === 'active' ? 'bg-green-50 border-green-200' :
                      term.status === 'closed' ? 'bg-slate-50 border-slate-200 opacity-75' :
                      'bg-white border-slate-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-800">{term.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          term.status === 'active' ? 'bg-green-200 text-green-800' :
                          term.status === 'closed' ? 'bg-slate-200 text-slate-600' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {term.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between border-b pb-1 border-slate-100">
                          <span>Starts</span>
                          <span className="font-medium text-slate-900">{format(new Date(term.start_date), "MMM d")}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-slate-100">
                          <span>Ends</span>
                          <span className="font-medium text-slate-900">{format(new Date(term.end_date), "MMM d")}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-slate-100">
                          <span>Fees Due</span>
                          <span className="font-medium text-red-600">{format(new Date(term.fee_due_date), "MMM d")}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        {term.status === 'upcoming' && year.is_current && (
                          <button className="text-sm font-semibold text-primary-600 hover:text-primary-800">
                            Open Term
                          </button>
                        )}
                        {term.status === 'active' && (
                          <button className="text-sm font-semibold text-red-600 hover:text-red-800">
                            Close Term
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
