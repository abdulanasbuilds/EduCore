import React from "react";
export const dynamic = 'force-dynamic';

export default async function ParentBehaviourPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Behaviour & Disciplinary Record</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-4 font-medium text-slate-600">Date</th>
              <th className="p-4 font-medium text-slate-600">Type</th>
              <th className="p-4 font-medium text-slate-600">Category</th>
              <th className="p-4 font-medium text-slate-600">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-4">2026-04-15</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Positive</span></td>
              <td className="p-4 font-medium">Academic Achievement</td>
              <td className="p-4 text-slate-600">Scored highest in the mid-term mathematics examination.</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4">2026-03-02</td>
              <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Negative</span></td>
              <td className="p-4 font-medium">Late to School</td>
              <td className="p-4 text-slate-600">Arrived 45 minutes late for morning assembly.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
