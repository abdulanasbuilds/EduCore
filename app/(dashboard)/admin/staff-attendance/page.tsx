import React from "react";
export const dynamic = 'force-dynamic';

export default async function StaffAttendancePage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Attendance</h1>
        <div className="flex gap-4">
          <input type="date" className="border p-2 rounded" defaultValue="2026-05-01" />
          <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-4 font-medium text-slate-600">Staff Name</th>
              <th className="p-4 font-medium text-slate-600">Role</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
              <th className="p-4 font-medium text-slate-600">Arrival Time</th>
              <th className="p-4 font-medium text-slate-600">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">Mr. Smith</td>
              <td className="p-4 text-slate-500">Subject Teacher</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">Present</button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Absent</button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Late</button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Leave</button>
                </div>
              </td>
              <td className="p-4">
                <input type="time" className="border p-1 rounded text-sm w-24" defaultValue="07:45" />
              </td>
              <td className="p-4">
                <input type="text" className="border p-1 rounded text-sm w-full" placeholder="Optional" />
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">Mrs. Johnson</td>
              <td className="p-4 text-slate-500">Class Teacher</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Present</button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Absent</button>
                  <button className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-medium">Late</button>
                  <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded text-xs font-medium">Leave</button>
                </div>
              </td>
              <td className="p-4">
                <input type="time" className="border p-1 rounded text-sm w-24" defaultValue="08:30" />
              </td>
              <td className="p-4">
                <input type="text" className="border p-1 rounded text-sm w-full" placeholder="Car broke down" defaultValue="Car broke down" />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
            Save All
          </button>
        </div>
      </div>
    </div>
  );
}
