"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function SetupPage() {
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key',
  };

  const isConfigured = Object.values(envs).every(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">EduCore Setup Required</h1>
          <p className="text-slate-500 mt-2">Environment variables must be configured to start the system.</p>
        </div>

        <div className="space-y-4 mb-8">
          {Object.entries(envs).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <code className="text-sm font-semibold text-slate-700">{key}</code>
              {value ? (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              ) : (
                <XCircle className="text-red-500 h-5 w-5" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-blue-900 mb-4">Instructions: How to get these values</h2>
          <div className="space-y-4 text-sm text-blue-800">
            <p className="font-semibold underline">SUPABASE:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to <a href="https://supabase.com" target="_blank" className="underline font-bold">supabase.com</a> and create a new project</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Copy <strong>Project URL</strong> → paste as <code>NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li>Copy <strong>anon/public key</strong> → paste as <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              <li>Copy <strong>service_role key</strong> → paste as <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
            </ol>
            <div className="mt-4 pt-4 border-t border-blue-200">
                <p><strong>For local dev:</strong> Add these to your <code>.env.local</code> file in the project root.</p>
                <p className="mt-2"><strong>For Vercel:</strong> Add these in <strong>Project Settings → Environment Variables</strong>.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
            {isConfigured ? (
                <Link 
                    href="/" 
                    className="bg-primary-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                >
                    System Configured - Go to Home
                </Link>
            ) : (
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh Page
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
