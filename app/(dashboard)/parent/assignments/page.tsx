import React from "react";
export const dynamic = 'force-dynamic';

export default async function ParentAssignmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assignments & Homework</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">Pending</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Submitted</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Graded</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">All</button>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
        <h3 className="text-red-800 font-bold mb-1">Overdue Assignments</h3>
        <p className="text-red-700 text-sm">Your child has 1 assignment that is past the due date.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assignment Card */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            OVERDUE
          </div>
          <div className="flex items-center gap-2 mb-3 mt-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-500">Mathematics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Algebra Worksheet</h2>
          <p className="text-slate-600 mb-4 text-sm flex-grow">Teacher: Mr. Smith</p>
          
          <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm font-medium flex items-center justify-between mb-4">
            <span>Due Date</span>
            <span>2026-04-28</span>
          </div>
          
          <div className="flex gap-3">
            <button className="w-full bg-slate-100 text-slate-700 py-2 rounded font-medium hover:bg-slate-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
