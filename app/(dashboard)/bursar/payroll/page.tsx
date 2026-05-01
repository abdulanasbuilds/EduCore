import React from "react";
export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <div className="flex gap-4 items-center">
          <select className="border p-2 rounded">
            <option>May 2026</option>
            <option>April 2026</option>
          </select>
          <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-medium text-slate-600">Staff Name</th>
              <th className="p-4 font-medium text-slate-600">Role</th>
              <th className="p-4 font-medium text-slate-600">Gross Salary</th>
              <th className="p-4 font-medium text-slate-600">Deductions</th>
              <th className="p-4 font-medium text-slate-600">Net Salary</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
              <th className="p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">John Doe</td>
              <td className="p-4 text-slate-500">Class Teacher</td>
              <td className="p-4">GHS 3,500</td>
              <td className="p-4">GHS 200</td>
              <td className="p-4 font-bold">GHS 3,300</td>
              <td className="p-4">
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Pending</span>
              </td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline">Record Salary</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
