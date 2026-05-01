import React from "react";
export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">School Events Calendar</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          Create Event
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-100 rounded text-sm font-medium">List View</button>
            <button className="px-3 py-1 bg-slate-200 rounded text-sm font-medium text-slate-500">Calendar Grid</button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Event Card */}
          <div className="flex border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-blue-600 w-32 flex flex-col items-center justify-center text-white p-4">
              <span className="text-sm font-medium uppercase tracking-wider">MAY</span>
              <span className="text-3xl font-bold">15</span>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold uppercase">General</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">End of Term Examinations Begin</h3>
                  <p className="text-slate-500 text-sm mt-1">All classes will begin their end-of-term examinations.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Target: <strong>All</strong></p>
                  <p>Location: <strong>Classrooms</strong></p>
                  <div className="mt-2 space-x-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Card 2 */}
          <div className="flex border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-amber-500 w-32 flex flex-col items-center justify-center text-white p-4">
              <span className="text-sm font-medium uppercase tracking-wider">MAY</span>
              <span className="text-3xl font-bold">28</span>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold uppercase">PTA</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Parent-Teacher Association Meeting</h3>
                  <p className="text-slate-500 text-sm mt-1">Mandatory meeting for all parents regarding the next academic year.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Target: <strong>Parents</strong></p>
                  <p>Location: <strong>Main Hall</strong></p>
                  <div className="mt-2 space-x-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
