"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", event_type: "general" });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;
      const { data } = await supabase
        .from("school_events")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("event_date");
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const upcoming = events.filter((e: any) => e.event_date >= new Date().toISOString().split("T")[0]);
  const past = events.filter((e: any) => e.event_date < new Date().toISOString().split("T")[0]);

  const handleAdd = async () => {
    if (!form.title || !form.event_date) return;
    const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
    if (!profile) return;
    const { data: inserted } = await supabase.from("school_events").insert({
      school_id: profile.school_id, title: form.title,
      description: form.description || null, event_date: form.event_date,
      location: form.location || null, event_type: form.event_type,
    }).select().single();
    if (inserted) { setEvents([...events, inserted].sort((a,b) => a.event_date.localeCompare(b.event_date))); setAddOpen(false); }
    setForm({ title: "", description: "", event_date: "", location: "", event_type: "general" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("school_events").delete().eq("id", id);
    setEvents(events.filter((e: any) => e.id !== id));
  };

  const typeColors: Record<string, string> = {
    general: "bg-blue-600", exam: "bg-purple-600", holiday: "bg-green-600",
    sports: "bg-orange-600", pta: "bg-amber-500", cultural: "bg-pink-600",
    graduation: "bg-indigo-600", other: "bg-slate-600",
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">School Events Calendar</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState icon="grades" title="No upcoming events" description="Create your first school event." />
          ) : (
            <div className="space-y-4">
              {upcoming.map((e: any) => (
                <div key={e.id} className="flex border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                  <div className={`${typeColors[e.event_type] || "bg-blue-600"} w-32 flex flex-col items-center justify-center text-white p-4 shrink-0`}>
                    <span className="text-sm font-medium uppercase tracking-wider">{format(new Date(e.event_date), "MMM")}</span>
                    <span className="text-3xl font-bold">{format(new Date(e.event_date), "dd")}</span>
                  </div>
                  <div className="p-4 flex-grow flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold uppercase">{e.event_type}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{e.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{e.description}</p>
                      {e.location && <p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No past events.</div>
          ) : (
            <div className="space-y-4">
              {past.map((e: any) => (
                <div key={e.id} className="flex border border-slate-100 rounded-lg overflow-hidden bg-white opacity-70">
                  <div className="bg-slate-400 w-32 flex flex-col items-center justify-center text-white p-4 shrink-0">
                    <span className="text-sm font-medium uppercase tracking-wider">{format(new Date(e.event_date), "MMM")}</span>
                    <span className="text-3xl font-bold">{format(new Date(e.event_date), "dd")}</span>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="text-lg font-bold text-slate-700">{e.title}</h3>
                    <p className="text-slate-400 text-sm">{e.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1" /></div>
            <div><Label>Date *</Label><Input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className="mt-1" /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="mt-1" /></div>
            <div>
              <Label>Type</Label>
              <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} className="w-full border rounded-md px-3 py-2 mt-1 text-sm">
                {["general","exam","holiday","sports","pta","cultural","graduation","other"].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title || !form.event_date}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
