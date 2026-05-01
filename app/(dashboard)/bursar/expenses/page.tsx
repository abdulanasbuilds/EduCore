import React from "react";
export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <div className="space-x-3">
          <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-200">
            Manage Categories
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
            Record Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total This Month</p>
          <p className="text-2xl font-bold text-slate-900">GHS 4,500</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Total This Term</p>
          <p className="text-2xl font-bold text-slate-900">GHS 12,350</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Biggest Category</p>
          <p className="text-2xl font-bold text-slate-900">Maintenance</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Remaining Budget</p>
          <p className="text-2xl font-bold text-green-600">GHS 7,650</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-medium text-slate-600">Date</th>
              <th className="p-4 font-medium text-slate-600">Category</th>
              <th className="p-4 font-medium text-slate-600">Description</th>
              <th className="p-4 font-medium text-slate-600">Amount (GHS)</th>
              <th className="p-4 font-medium text-slate-600">Recorded By</th>
              <th className="p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">2026-05-01</td>
              <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Utilities</span></td>
              <td className="p-4">Electricity Bill for April</td>
              <td className="p-4 font-semibold">1,200.00</td>
              <td className="p-4">Admin User</td>
              <td className="p-4"><button className="text-blue-600 hover:underline">View</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
