import React from "react";
export const dynamic = 'force-dynamic';

export default async function StudentAssignmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">Pending</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Submitted</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Graded</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assignment Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-500">Mathematics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Algebra Worksheet</h2>
          <p className="text-slate-600 mb-4 text-sm flex-grow">Teacher: Mr. Smith</p>
          
          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm font-medium flex items-center justify-between mb-4">
            <span>Due Tomorrow</span>
            <span>2026-05-02</span>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-slate-100 text-slate-700 py-2 rounded font-medium hover:bg-slate-200">
              Download
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">
              Submit Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
