"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import Link from "next/link";
import { 
  Wallet, Search, AlertTriangle, TrendingUp, Download, Send, CreditCard
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export const dynamic = 'force-dynamic';

export default function BursarDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Payment Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, school_id, full_name")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      const schoolId = profile.school_id;
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = subDays(new Date(), 1).toISOString().split('T')[0];

      // Current Term
      const { data: currentTerm } = await supabase
        .from("terms")
        .select("id, name, fee_due_date")
        .eq("school_id", schoolId)
        .eq("status", "active")
        .single();

      // Fee Assignments for Term
      let assignments: any[] = [];
      if (currentTerm) {
        const { data: fa } = await supabase.from("fee_assignments").select("id").eq("term_id", currentTerm.id);
        assignments = fa || [];
      }
      const assignmentIds = assignments.map(a => a.id);

      // Student Fees Data (Term)
      const { data: studentFees } = await supabase
        .from("student_fees")
        .select("id, student_id, amount_owed, amount_paid, balance, status, students(full_name, admission_number, student_class_history(class_id, classes(name)))")
        .in("fee_assignment_id", assignmentIds);

      let termTarget = 0;
      let termCollected = 0;
      let totalOutstanding = 0;
      let defaultersCount = 0;
      const defaulterList: any[] = [];

      studentFees?.forEach(fee => {
        termTarget += fee.amount_owed;
        termCollected += fee.amount_paid;
        totalOutstanding += fee.balance;
        if (fee.balance > 0) {
          defaultersCount++;
          const hist = (fee.students as any)?.student_class_history?.find((h:any) => h.classes);
          defaulterList.push({
            id: fee.id,
            student_id: fee.student_id,
            name: (fee.students as any)?.full_name,
            class: hist?.classes?.name || "Unknown",
            owed: fee.balance,
            status: fee.status
          });
        }
      });
      // Sort defaulters highest owed first
      defaulterList.sort((a,b) => b.owed - a.owed);

      // Payments Data
      const { data: payments } = await supabase
        .from("fee_payments")
        .select("id, amount, payment_date, payment_method, created_at, receipt_number, receipt_url, students(full_name)")
        .eq("students.school_id", schoolId)
        .order("created_at", { ascending: false });

      const realPayments = payments?.filter(p => p.students) || [];
      const recentPayments = realPayments.slice(0, 20);
      
      let collectedToday = 0;
      let collectedYesterday = 0;
      let paymentsTodayCount = 0;
      const last3Today = [];

      realPayments.forEach(p => {
        if (p.payment_date === todayStr) {
          collectedToday += p.amount;
          paymentsTodayCount++;
          if (last3Today.length < 3) last3Today.push(p);
        } else if (p.payment_date === yesterdayStr) {
          collectedYesterday += p.amount;
        }
      });

      // Chart Data (Last 14 days)
      const chartMap: Record<string, number> = {};
      for(let i=13; i>=0; i--) {
        const d = subDays(new Date(), i).toISOString().split('T')[0];
        chartMap[d] = 0;
      }
      realPayments.forEach(p => {
        if (chartMap[p.payment_date] !== undefined) {
          chartMap[p.payment_date] += p.amount;
        }
      });
      const chartData = Object.keys(chartMap).map(date => ({
        date: format(new Date(date), 'dd MMM'),
        amount: chartMap[date] / 100
      }));

      setData({
        profile,
        currentTerm,
        schoolId,
        stats: {
          collectedToday,
          collectedYesterday,
          termTarget,
          termCollected,
          totalOutstanding,
          defaultersCount,
          paymentsTodayCount,
          last3Today
        },
        defaulterList,
        recentPayments,
        chartData
      });
      setLoading(false);
    }
    loadDashboard();
  }, [supabase]);

  // Search logic for Quick Payment
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name, admission_number")
        .eq("school_id", data?.schoolId)
        .or(`full_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%`)
        .limit(5);
        
      if (students) {
        // fetch balances
        const sIds = students.map(s => s.id);
        const { data: fees } = await supabase.from("student_fees").select("student_id, balance").in("student_id", sIds);
        const mapped = students.map(s => {
          const bal = fees?.find(f => f.student_id === s.id)?.balance || 0;
          return { ...s, balance: bal };
        });
        setSearchResults(mapped);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, data?.schoolId, supabase]);

  const defaulterCols = [
    { accessorKey: "name", header: "Student Name", cell: ({row}:any) => <span className="font-bold text-slate-800">{row.original.name}</span> },
    { accessorKey: "class", header: "Class" },
    { accessorKey: "owed", header: "Amount Owed", cell: ({row}:any) => <span className="text-red-600 font-bold">GHS {(row.original.owed/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</span> },
    { id: "actions", header: "Action", cell: ({row}:any) => (
      <div className="flex gap-2">
        <Link href={`/bursar/payment?student=${row.original.student_id}`} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold hover:bg-emerald-200">Pay</Link>
        <button className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold hover:bg-amber-200">Remind</button>
      </div>
    )}
  ];
  const defaulterTable = useReactTable({ data: data?.defaulterList || [], columns: defaulterCols, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  const paymentCols = [
    { accessorKey: "name", header: "Student", cell: ({row}:any) => <span className="font-semibold text-slate-800">{(row.original.students as any)?.full_name}</span> },
    { accessorKey: "amount", header: "Amount", cell: ({row}:any) => <span className="text-emerald-600 font-bold">GHS {(row.original.amount/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</span> },
    { accessorKey: "payment_method", header: "Method" },
    { accessorKey: "created_at", header: "Time", cell: ({row}:any) => format(new Date(row.original.created_at), 'dd MMM, HH:mm') },
    { id: "receipt", header: "Receipt", cell: ({row}:any) => (
      <button className="text-primary-600 hover:text-primary-800"><Download className="h-4 w-4" /></button>
    )}
  ];
  const paymentTable = useReactTable({ data: data?.recentPayments || [], columns: paymentCols, getCoreRowModel: getCoreRowModel() });

  if (loading) return <div className="p-6 text-center text-slate-500">Loading dashboard...</div>;

  const { profile, currentTerm, stats, chartData } = data;
  const isOverdue = currentTerm && new Date(currentTerm.fee_due_date) < new Date();

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        {currentTerm && (
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-800">Fee Due Date:</p>
            <p className={`font-bold ${isOverdue ? 'text-red-600' : 'text-primary-600'}`}>
              {format(new Date(currentTerm.fee_due_date), 'dd MMM yyyy')} {isOverdue && "(OVERDUE)"}
            </p>
          </div>
        )}
      </div>

      {/* QUICK PAYMENT RECORDING */}
      <div className="bg-primary-900 rounded-xl p-6 shadow-md text-white">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Quick Payment Recording</h2>
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student by name or admission number to record payment..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg text-slate-900 font-medium focus:ring-4 focus:ring-primary-500/50 outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-10 text-slate-800">
              {searchResults.map(s => (
                <div key={s.id} className="flex justify-between items-center p-4 border-b hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-900">{s.full_name}</p>
                    <p className="text-xs text-slate-500">{s.admission_number}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className={`font-bold ${s.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>GHS {(s.balance/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</p>
                    </div>
                    <Link href={`/bursar/payment?student=${s.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                      Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Collected Today</p>
          <h2 className="text-3xl font-extrabold text-emerald-600">GHS {(stats.collectedToday/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</h2>
          <p className="text-xs font-medium mt-2 flex items-center gap-1 text-slate-500">
            {stats.collectedToday >= stats.collectedYesterday ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />}
            vs yesterday: {(stats.collectedToday - stats.collectedYesterday >= 0 ? '+' : '')}GHS {((stats.collectedToday - stats.collectedYesterday)/100).toLocaleString('en-GH')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Term Total Collected</p>
          <h2 className="text-3xl font-extrabold text-slate-800">GHS {(stats.termCollected/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</h2>
          <p className="text-xs text-slate-500 mt-2">{stats.termTarget > 0 ? Math.round((stats.termCollected/stats.termTarget)*100) : 0}% of target collected</p>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> Outstanding</p>
          <h2 className="text-3xl font-extrabold text-red-700">GHS {(stats.totalOutstanding/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</h2>
          <p className="text-xs text-red-600/80 mt-2">By {stats.defaultersCount} students</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Payments Today</p>
          <h2 className="text-3xl font-extrabold text-slate-800">{stats.paymentsTodayCount}</h2>
          <div className="text-xs text-slate-500 mt-2 space-y-1">
            {stats.last3Today.map((p:any) => (
              <p key={p.id} className="truncate">{(p.students as any)?.full_name} (+GHS {p.amount/100})</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DEFAULTER LIST */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Defaulter List
            </h3>
            <button className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Send className="h-4 w-4" /> Send Reminder to All ({stats.defaultersCount})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                {defaulterTable.getHeaderGroups().map((hg:any) => (
                  <tr key={hg.id}>{hg.headers.map((h:any) => <th key={h.id} className="px-4 py-3 border-b">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
                ))}
              </thead>
              <tbody>
                {defaulterTable.getRowModel().rows.slice(0, 10).map((row:any) => (
                  <tr key={row.id} className="border-b hover:bg-red-50/50">
                    {row.getVisibleCells().map((cell:any) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.defaulterList.length > 10 && <p className="text-center text-xs text-primary-600 font-bold mt-4 cursor-pointer hover:underline">View All Defaulters</p>}
            {data.defaulterList.length === 0 && <p className="text-center py-6 text-slate-500">No defaulters. All fees are paid!</p>}
          </div>
        </div>

        <div className="space-y-6">
          {/* FEE COLLECTION CHART */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Fee Collection (14 Days)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(val:number) => [`GHS ${val.toLocaleString()}`, 'Collected']} />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Recent Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  {paymentTable.getHeaderGroups().map((hg:any) => (
                    <tr key={hg.id}>{hg.headers.map((h:any) => <th key={h.id} className="px-2 py-2 border-b">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
                  ))}
                </thead>
                <tbody>
                  {paymentTable.getRowModel().rows.slice(0, 5).map((row:any) => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      {row.getVisibleCells().map((cell:any) => <td key={cell.id} className="px-2 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentPayments.length === 0 && <p className="text-center py-4 text-slate-500">No recent payments.</p>}
              {data.recentPayments.length > 5 && <p className="text-center text-primary-600 font-bold mt-4 cursor-pointer hover:underline">View All Records</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
