"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, X, Download, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { bulkCreateStudentsAction } from "@/actions/student-actions";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: { id: string; name: string }[];
}

export function CSVImportModal({ isOpen, onClose, classes }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ row: number; error: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient() as any;
  const router = useRouter();

  const handleDownloadTemplate = () => {
    const template = "fullName,gender,dateOfBirth,classId,guardianName,guardianPhone,guardianRelationship\nJohn Doe,Male,2010-05-15," + (classes[0]?.id || "CLASS_ID_HERE") + ",Jane Doe,0241234567,Mother";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setImportResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const validationErrors: { row: number; error: string }[] = [];

        data.forEach((row, index) => {
          if (!row["fullName"]) validationErrors.push({ row: index + 1, error: "Missing fullName" });
          if (!row["dateOfBirth"]) validationErrors.push({ row: index + 1, error: "Missing dateOfBirth" });
          if (!["Male", "Female"].includes(row["gender"])) validationErrors.push({ row: index + 1, error: "Invalid gender. Must be Male or Female" });
          
          const classId = row["classId"];
          if (!classes.some(c => c.id === classId)) {
            validationErrors.push({ row: index + 1, error: `Class ID '${classId}' not found in system` });
          }

          if (!row["guardianName"]) validationErrors.push({ row: index + 1, error: "Missing guardianName" });
          if (!row["guardianPhone"]) validationErrors.push({ row: index + 1, error: "Missing guardianPhone" });
          if (!row["guardianRelationship"]) validationErrors.push({ row: index + 1, error: "Missing guardianRelationship" });
        });

        setPreview(data);
        setErrors(validationErrors);
      }
    });
  };

  const handleImport = async () => {
    if (errors.length > 0 || preview.length === 0) return;

    setIsImporting(true);
    const result = await bulkCreateStudentsAction(preview);

    if (result.success) {
      setImportResult({ success: result.data?.count || preview.length, failed: 0 });
    } else {
      alert(result.message);
    }
    setIsImporting(false);
    router.refresh();
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary-600" />
            Bulk Student Import
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto space-y-6">
          {!file && !importResult ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">How to bulk import students:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Download the CSV template</li>
                    <li>Fill in your student data exactly matching the format</li>
                    <li>Ensure class names match exactly what is in the system</li>
                    <li>Upload the completed file here</li>
                  </ol>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="mt-3 flex items-center gap-2 text-blue-700 font-semibold hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download Template
                  </button>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="font-medium text-slate-700">Click to upload CSV file</p>
                <p className="text-sm text-slate-500 mt-1">.csv format only</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          ) : importResult ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Import Complete</h3>
              <p className="text-slate-600">
                Successfully imported <span className="font-bold text-green-600">{importResult.success}</span> students.
                {importResult.failed > 0 && (
                  <span className="text-red-600 ml-1">Failed to import {importResult.failed} rows.</span>
                )}
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button 
                  onClick={reset}
                  className="px-4 py-2 border rounded-md font-medium text-slate-700 hover:bg-slate-50"
                >
                  Import More
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-primary-800 text-white rounded-md font-medium hover:bg-primary-700"
                >
                  Close & View Students
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-700">{file?.name}</span>
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{preview.length} rows</span>
                </div>
                <button onClick={reset} className="text-sm text-red-600 hover:underline">Remove</button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> 
                    Found {errors.length} Validation Errors
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto pl-5 list-disc">
                    {errors.map((e, i) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-100 sticky top-0 font-semibold text-slate-600">
                      <tr>
                        <th className="px-4 py-2">Row</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Class</th>
                        <th className="px-4 py-2">Guardian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {preview.slice(0, 50).map((row, i) => (
                        <tr key={i} className={errors.some(e => e.row === i + 1) ? "bg-red-50/50" : ""}>
                        <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{row["fullName"]}</td>
                        <td className="px-4 py-2">{classes.find(c => c.id === row["classId"])?.name || row["classId"]}</td>
                        <td className="px-4 py-2">{row["guardianName"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 50 && (
                  <div className="bg-slate-50 p-2 text-center text-xs text-slate-500 border-t">
                    Showing first 50 rows of {preview.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {file && !importResult && (
          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 border rounded-md font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 min-h-[44px]"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={isImporting || errors.length > 0}
              className="px-6 py-2 bg-primary-800 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 min-h-[44px]"
            >
              {isImporting ? "Importing..." : `Import ${preview.length} Students`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
