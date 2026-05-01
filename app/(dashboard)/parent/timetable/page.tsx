import React from "react";
export const dynamic = 'force-dynamic';

export default async function ParentTimetablePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Class Timetable</h1>
      
      {/* What to bring tomorrow */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-amber-900 mb-2">What to bring tomorrow</h2>
        <p className="text-amber-800">
          Remind your child to pack books for: <span className="font-semibold">Mathematics, English, Science, and History.</span>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Weekly Schedule</h3>
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
                <td className="border border-slate-200 p-2 text-center">
                  <div className="font-semibold">Science</div>
                </td>
                <td className="border border-slate-200 p-2 text-center">
                  <div className="font-semibold">Mathematics</div>
                </td>
                <td className="border border-slate-200 p-2 text-center">
                  <div className="font-semibold">English</div>
                </td>
                <td className="border border-slate-200 p-2 text-center">
                  <div className="font-semibold">History</div>
                </td>
                <td className="border border-slate-200 p-2 text-center">
                  <div className="font-semibold">PE</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
