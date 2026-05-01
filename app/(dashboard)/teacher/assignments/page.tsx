import React from "react";
export const dynamic = 'force-dynamic';

export default async function TeacherAssignmentsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Management</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <select className="border p-2 rounded w-48">
            <option>All Classes</option>
            <option>Grade 10</option>
          </select>
          <select className="border p-2 rounded w-48">
            <option>All Subjects</option>
            <option>Mathematics</option>
          </select>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="p-4 font-medium text-slate-600">Title</th>
              <th className="p-4 font-medium text-slate-600">Class</th>
              <th className="p-4 font-medium text-slate-600">Subject</th>
              <th className="p-4 font-medium text-slate-600">Due Date</th>
              <th className="p-4 font-medium text-slate-600">Submissions</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
              <th className="p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">Algebra Worksheet</td>
              <td className="p-4">Grade 10</td>
              <td className="p-4">Mathematics</td>
              <td className="p-4">2026-05-10</td>
              <td className="p-4">12 / 30</td>
              <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Published</span></td>
              <td className="p-4"><button className="text-blue-600 hover:underline">View Submissions</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
