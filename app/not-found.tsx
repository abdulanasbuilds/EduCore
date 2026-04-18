import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <FileQuestion className="h-8 w-8 text-slate-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">404 - Not Found</h1>
          <p className="text-slate-500 text-sm">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-primary-800 text-white px-8 py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            <Home className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
