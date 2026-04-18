"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-slate-500 text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-md font-medium hover:bg-slate-50 transition-colors"
          >
            <Home className="h-4 w-4" /> Back Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mt-8">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
