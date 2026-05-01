import React from "react";
export const dynamic = 'force-dynamic';

export default async function TeacherEventsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">School Events</h1>

      <div className="space-y-4 max-w-4xl">
        <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
          <div className="bg-blue-600 w-32 flex flex-col items-center justify-center text-white p-4">
            <span className="text-sm font-medium uppercase tracking-wider">MAY</span>
            <span className="text-3xl font-bold">15</span>
          </div>
          <div className="p-4 flex-grow flex justify-between items-center">
            <div>
              <div className="flex gap-2 mb-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold uppercase">General</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">End of Term Examinations Begin</h3>
              <p className="text-slate-500 text-sm mt-1">All classes will begin their end-of-term examinations.</p>
              <p className="text-slate-500 text-sm mt-2 font-medium">📍 Classrooms</p>
            </div>
            <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-200 text-sm font-medium">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
