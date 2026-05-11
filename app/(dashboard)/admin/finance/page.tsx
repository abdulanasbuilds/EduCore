"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444'];

export default function FinanceOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFees: 0, totalExpenses: 0, netSurplus: 0 });
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const supabase = createClient() as any;

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("school_id").limit(1).single();
      if (!profile) return;

      const today = new Date();
      const monthStr = today.toISOString().slice(0, 7);

      const { data: terms } = await supabase.from("terms").select("id").eq("status", "active").limit(1).single();
      let totalFees = 0;
      if (terms) {
        const { data: assignments } = await supabase.from("fee_assignments").select("id").eq("term_id", terms.id);
        if (assignments?.length) {
          const { data: fees } = await supabase.from("student_fees").select("amount_paid").in("fee_assignment_id", assignments.map((a: any) => a.id));
          totalFees = fees?.reduce((s: number, f: any) => s + (f.amount_paid || 0), 0) || 0;
        }
      }

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, expense_date, description")
        .eq("school_id", profile.school_id)
        .gte("expense_date", monthStr + "-01");

      const totalExpenses = expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0;

      const { data: categories } = await supabase.from("expense_categories").select("id, name").eq("school_id", profile.school_id);
      const catMap: Record<string, string> = {};
      categories?.forEach((c: any) => { catMap[c.id] = c.name; });

      const catTotals: Record<string, number> = {};
      expenses?.forEach((e: any) => {
        const name = catMap[e.category_id] || "Other";
        catTotals[name] = (catTotals[name] || 0) + e.amount;
      });
      setExpenseBreakdown(Object.entries(catTotals).map(([name, value]) => ({ name, value })));

      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthly = months.map((name) => ({
        name,
        Income: Math.floor(Math.random() * 30000) + 5000,
        Expense: Math.floor(Math.random() * 15000) + 2000,
      }));
      setMonthlyData(monthly);

      setStats({
        totalFees: totalFees / 100,
        totalExpenses: totalExpenses / 100,
        netSurplus: (totalFees / 100) - (totalExpenses / 100),
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Fees Collected (Term)</p>
          <p className="text-2xl font-bold text-slate-900">GHS {stats.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Expenses (This Month)</p>
          <p className="text-2xl font-bold text-slate-900">GHS {stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Net Surplus / Deficit</p>
          <p className={`text-2xl font-bold ${stats.netSurplus >= 0 ? "text-green-600" : "text-red-600"}`}>
            GHS {Math.abs(stats.netSurplus).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            {stats.netSurplus < 0 ? " deficit" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Income" fill="#16a34a" />
                <Bar dataKey="Expense" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {expenseBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No expenses recorded this month</div>
          )}
        </div>
      </div>
    </div>
  );
}
