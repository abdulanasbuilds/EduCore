"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";

export default function ParentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("school_events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .in("target", ["all", "parents"])
        .order("event_date")
        .limit(20);
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      {events.length === 0 ? (
        <EmptyState icon="grades" title="No upcoming events" description="School events will appear here." />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {events.map((e: any) => (
            <div key={e.id} className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="bg-amber-500 w-32 flex flex-col items-center justify-center text-white p-4 shrink-0">
                <span className="text-sm font-medium uppercase tracking-wider">{format(new Date(e.event_date), "MMM")}</span>
                <span className="text-3xl font-bold">{format(new Date(e.event_date), "dd")}</span>
              </div>
              <div className="p-4 flex-grow flex justify-between items-center">
                <div>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold uppercase">{e.event_type}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{e.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{e.description}</p>
                  {e.location && <p className="text-slate-400 text-sm mt-1">{e.location}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
