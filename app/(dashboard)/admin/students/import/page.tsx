"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { bulkCreateStudentsAction } from "@/actions/student-actions";

export const dynamic = 'force-dynamic';

export default function StudentImportPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    async function loadClasses() {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single() as any;
      if (!profile) return;
      
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", profile.school_id)
        .order("level");
        
      if (data) setClasses(data);
    }
    loadClasses();
  }, [supabase]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      if (values.length < 2) return null;
      
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    }).filter(Boolean);

    setParsedData(results);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setStatus({ type: null, message: "" });

    const result = await bulkCreateStudentsAction(parsedData);

    setLoading(false);
    if (result.success) {
      setStatus({ type: 'success', message: result.message });
      setTimeout(() => router.push("/admin/students"), 2000);
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "fullName,gender,dateOfBirth,classId,guardianName,guardianPhone,guardianRelationship\nJohn Doe,Male,2012-05-15," + (classes[0]?.id || "CLASS_ID_HERE") + ",Jane Doe,0240000000,Mother";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'educore_student_template.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bulk Student Import</h1>
          <p className="text-slate-500 text-sm mt-1">Upload a CSV file to enroll multiple students at once.</p>
        </div>
        <Link href="/admin/students" className="text-sm font-bold text-slate-500 hover:text-slate-800">Back to List</Link>
      </div>

      {status.type && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Download className="h-4 w-4" /> 1. Get Template</h3>
            <p className="text-xs text-slate-500 mb-4">Download the CSV template to ensure your data is formatted correctly.</p>
            <button 
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-bold text-sm transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" /> Download template
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Class IDs</h3>
            <p className="text-xs text-slate-500 mb-4">You'll need these IDs for the `classId` column in your CSV.</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {classes.map(c => (
                <div key={c.id} className="p-2 bg-slate-50 rounded border text-[10px] font-mono">
                  <p className="font-bold text-slate-700 mb-1">{c.name}</p>
                  <p className="text-slate-400 select-all cursor-pointer">{c.id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
            <div className="bg-primary-50 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Upload your CSV</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">Drag and drop your filled template here, or click to browse files.</p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" 
            />
          </div>

          {parsedData.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Preview ({parsedData.length} students)</h3>
                <button 
                  onClick={handleImport}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {loading ? "Importing..." : "Confirm & Import"}
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">DOB</th>
                      <th className="px-4 py-3">Guardian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800">{row.fullName}</td>
                        <td className="px-4 py-3">{row.gender}</td>
                        <td className="px-4 py-3">{row.dateOfBirth}</td>
                        <td className="px-4 py-3">{row.guardianName} ({row.guardianPhone})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
