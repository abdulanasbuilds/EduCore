import React from "react";
export const dynamic = 'force-dynamic';

export default async function ParentEventsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>

      <div className="space-y-4 max-w-4xl">
        <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
          <div className="bg-amber-500 w-32 flex flex-col items-center justify-center text-white p-4">
            <span className="text-sm font-medium uppercase tracking-wider">MAY</span>
            <span className="text-3xl font-bold">28</span>
          </div>
          <div className="p-4 flex-grow flex justify-between items-center">
            <div>
              <div className="flex gap-2 mb-1">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold uppercase">PTA</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Parent-Teacher Association Meeting</h3>
              <p className="text-slate-500 text-sm mt-1">Mandatory meeting for all parents regarding the next academic year.</p>
              <p className="text-slate-500 text-sm mt-2 font-medium">📍 Main Hall</p>
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
