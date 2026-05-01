import React from "react";
export const dynamic = 'force-dynamic';

export default async function AdminTimetablePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Timetable Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-slate-500 mb-4">Select a class to manage its timetable.</p>
        {/* Placeholder for Class Selector */}
        <select className="border p-2 rounded mb-6 w-64">
          <option>Select Class</option>
        </select>

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
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                  <span className="text-slate-400">+ Add Lesson</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-white hover:bg-slate-50 cursor-pointer">
                  <div className="font-semibold">Mathematics</div>
                  <div className="text-xs text-slate-500">Mr. Smith</div>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                  <span className="text-slate-400">+ Add Lesson</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                  <span className="text-slate-400">+ Add Lesson</span>
                </td>
                <td className="border border-slate-200 p-2 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                  <span className="text-slate-400">+ Add Lesson</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
            Manage Time Slots
          </button>
        </div>
      </div>
    </div>
  );
}
