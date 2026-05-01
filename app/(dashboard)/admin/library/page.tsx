import React from "react";
export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Library Management</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-800">
          Add Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">Books Catalog</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Issue Book</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Returns</button>
        <button className="px-4 py-2 text-slate-500 hover:text-slate-800">Overdue Books</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN..." 
            className="w-full max-w-md border p-2 rounded shadow-sm"
          />
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="p-4 font-medium text-slate-600">Title</th>
              <th className="p-4 font-medium text-slate-600">Author</th>
              <th className="p-4 font-medium text-slate-600">Category</th>
              <th className="p-4 font-medium text-slate-600">Total Copies</th>
              <th className="p-4 font-medium text-slate-600">Available</th>
              <th className="p-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium text-blue-900">Things Fall Apart</td>
              <td className="p-4 text-slate-600">Chinua Achebe</td>
              <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">Literature</span></td>
              <td className="p-4">15</td>
              <td className="p-4"><span className="text-green-600 font-bold">12</span></td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline mr-3">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium text-blue-900">Advanced Mathematics</td>
              <td className="p-4 text-slate-600">K.A. Stroud</td>
              <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">Textbook</span></td>
              <td className="p-4">5</td>
              <td className="p-4"><span className="text-red-600 font-bold">0</span></td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline mr-3">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
