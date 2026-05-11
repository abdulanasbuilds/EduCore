"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Plus, Edit, Trash2, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function LibraryPage() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("catalog");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", category: "", totalCopies: "1" });
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;
      const { data } = await supabase.from("books").select("*").eq("school_id", profile.school_id).order("title");
      setBooks(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = books.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(search.toLowerCase())
  );

  const overdue = books.filter((b: any) => b.available_copies < b.total_copies);

  const handleAdd = async () => {
    if (!form.title) return;
    const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
    if (!profile) return;
    const { data: inserted } = await supabase.from("books").insert({
      school_id: profile.school_id, title: form.title, author: form.author || null,
      isbn: form.isbn || null, category: form.category || null,
      total_copies: parseInt(form.totalCopies) || 1,
      available_copies: parseInt(form.totalCopies) || 1,
    }).select().single();
    if (inserted) {
      setBooks([...books, inserted]);
      setAddOpen(false);
      setForm({ title: "", author: "", isbn: "", category: "", totalCopies: "1" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("books").delete().eq("id", id);
    setBooks(books.filter((b: any) => b.id !== id));
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Library Management</h1>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="catalog">Books Catalog</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search by title, author, or ISBN..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon="grades" title="No books found" description="Add your first book to the library catalog." />
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-white">
                    <th className="p-4 font-medium text-slate-600">Title</th>
                    <th className="p-4 font-medium text-slate-600">Author</th>
                    <th className="p-4 font-medium text-slate-600">Category</th>
                    <th className="p-4 font-medium text-slate-600 text-center">Total</th>
                    <th className="p-4 font-medium text-slate-600 text-center">Available</th>
                    <th className="p-4 font-medium text-slate-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b: any) => (
                    <tr key={b.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{b.title}</td>
                      <td className="p-4 text-slate-600">{b.author || "—"}</td>
                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{b.category || "Uncategorized"}</span></td>
                      <td className="p-4 text-center">{b.total_copies}</td>
                      <td className={`p-4 text-center font-bold ${b.available_copies < b.total_copies ? "text-red-600" : "text-green-600"}`}>
                        {b.available_copies}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline text-sm inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-slate-500">
            {overdue.length === 0 ? "No overdue books currently." : `${overdue.length} book(s) currently checked out.`}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="mt-1" /></div>
            <div><Label>ISBN</Label><Input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} className="mt-1" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="mt-1" /></div>
            <div><Label>Total Copies</Label><Input type="number" min="1" value={form.totalCopies} onChange={e => setForm({...form, totalCopies: e.target.value})} className="mt-1" /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
