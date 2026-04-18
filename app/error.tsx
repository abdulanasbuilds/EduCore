"use client";

import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-8">
              We encountered an unexpected error. Our technical team has been notified.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full bg-primary-800 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors min-h-[44px]"
              >
                Try again
              </button>
              <Link
                href="/"
                className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-md font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
            {error.digest && (
              <p className="mt-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
