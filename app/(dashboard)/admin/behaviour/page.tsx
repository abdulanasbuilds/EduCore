import React from "react";
export const dynamic = 'force-dynamic';

export default async function BehaviourPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Behaviour & Disciplinary Tracker</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          Log Behaviour
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Incidents (Term)</p>
          <p className="text-2xl font-bold text-slate-900">142</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Positive vs Negative</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-green-600">60%</span>
            <span className="text-slate-400">/</span>
            <span className="text-lg font-bold text-red-600">40%</span>
          </div>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm font-medium text-red-800">Students Flagged (3+ Negative)</p>
          <p className="text-2xl font-bold text-red-900">4 Students</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <select className="border p-2 rounded w-48"><option>All Classes</option></select>
          <select className="border p-2 rounded w-48"><option>All Types</option><option>Positive</option><option>Negative</option></select>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="p-4 font-medium text-slate-600">Date</th>
              <th className="p-4 font-medium text-slate-600">Student Name</th>
              <th className="p-4 font-medium text-slate-600">Class</th>
              <th className="p-4 font-medium text-slate-600">Type</th>
              <th className="p-4 font-medium text-slate-600">Category</th>
              <th className="p-4 font-medium text-slate-600">Logged By</th>
              <th className="p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">2026-05-01</td>
              <td className="p-4 font-medium">John Doe</td>
              <td className="p-4">Grade 10</td>
              <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Negative</span></td>
              <td className="p-4">Late to School</td>
              <td className="p-4">Mr. Smith</td>
              <td className="p-4"><button className="text-blue-600 hover:underline">View Details</button></td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4">2026-05-01</td>
              <td className="p-4 font-medium">Jane Smith</td>
              <td className="p-4">Grade 12</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Positive</span></td>
              <td className="p-4">Academic Achievement</td>
              <td className="p-4">Mrs. Johnson</td>
              <td className="p-4"><button className="text-blue-600 hover:underline">View Details</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
