"use client"
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

export default function FinanceOverviewPage() {
  const barData = [
    { name: 'Jan', Income: 4000, Expense: 2400 },
    { name: 'Feb', Income: 3000, Expense: 1398 },
    { name: 'Mar', Income: 2000, Expense: 9800 },
    { name: 'Apr', Income: 2780, Expense: 3908 },
    { name: 'May', Income: 1890, Expense: 4800 },
  ];
  
  const pieData = [
    { name: 'Salaries', value: 400 },
    { name: 'Utilities', value: 300 },
    { name: 'Maintenance', value: 300 },
    { name: 'Supplies', value: 200 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Fees Collected (Term)</p>
          <p className="text-2xl font-bold text-slate-900">GHS 125,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Expenses (Term)</p>
          <p className="text-2xl font-bold text-slate-900">GHS 45,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Net Surplus/Deficit</p>
          <p className="text-2xl font-bold text-green-600">+ GHS 80,000</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
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

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
