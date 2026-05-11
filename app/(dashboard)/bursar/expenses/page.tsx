"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;
      const today = new Date();
      const monthStr = today.toISOString().slice(0, 7);
      const [{ data: cat }, { data: exp }] = await Promise.all([
        supabase.from("expense_categories").select("*").eq("school_id", profile.school_id).order("name"),
        supabase.from("expenses")
          .select("*, expense_categories(name)")
          .eq("school_id", profile.school_id)
          .gte("expense_date", monthStr + "-01")
          .order("expense_date", { ascending: false }),
      ]);
      setCategories(cat || []);
      setExpenses(exp || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalMonth = expenses.reduce((s, e: any) => s + (e.amount || 0), 0) / 100;
  const catMap: Record<string, string> = {};
  categories.forEach(c => { catMap[c.id] = c.name; });
  const topCat = Object.entries(catMap).reduce((best, [id, name]) => {
    const sum = expenses.filter((e: any) => e.category_id === id).reduce((s, e: any) => s + e.amount, 0);
    return sum > (best[1] || 0) ? [name, sum] : best;
  }, ["", 0]);

  if (loading) return <div className="p-6"><div className="h-64 bg-slate-100 rounded animate-pulse" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expense Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-slate-500">Total This Month</p>
          <p className="text-2xl font-bold">GHS {totalMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-slate-500">Transactions</p>
          <p className="text-2xl font-bold">{expenses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm font-medium text-slate-500">Top Category</p>
          <p className="text-2xl font-bold">{topCat[0] || "—"}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No expenses recorded this month.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 font-medium text-slate-600">Date</th>
                <th className="p-4 font-medium text-slate-600">Category</th>
                <th className="p-4 font-medium text-slate-600">Description</th>
                <th className="p-4 font-medium text-slate-600 text-right">Amount (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e: any) => (
                <tr key={e.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 text-sm">{format(new Date(e.expense_date), "MMM d, yyyy")}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{catMap[e.category_id] || "—"}</span>
                  </td>
                  <td className="p-4 text-slate-600">{e.description}</td>
                  <td className="p-4 text-right font-semibold">{(e.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
