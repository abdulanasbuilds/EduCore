import React from "react";
export const dynamic = 'force-dynamic';

export default async function TeacherTimetablePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Timetable</h1>
      
      {/* Next Class Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-blue-600 font-medium text-sm mb-1">YOUR NEXT CLASS</p>
          <h2 className="text-xl font-bold text-slate-900">Mathematics with Grade 10 — Room 4</h2>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-medium">Starts in</p>
          <p className="text-2xl font-bold text-blue-700">45 mins</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Weekly Schedule</h3>
        {/* Weekly Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-2 text-left">Time</th>
                <th className="border border-slate-200 p-2 text-center">Monday</th>
                <th className="border border-slate-200 p-2 text-center">Tuesday</th>
                <th className="border border-slate-200 p-2 text-center">Wednesday</th>
                <th className="border border-slate-200 p-2 text-center">Thursday</th>
                <th className="border border-slate-200 p-2 text-center">Friday</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-2 font-medium">08:00 - 09:00</td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50">
                  <span className="text-slate-400">-</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-blue-50 border-blue-200">
                  <div className="font-semibold text-blue-900">Mathematics</div>
                  <div className="text-xs text-blue-700">Grade 10 • Room 4</div>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50">
                  <span className="text-slate-400">-</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50">
                  <span className="text-slate-400">-</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50">
                  <span className="text-slate-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
