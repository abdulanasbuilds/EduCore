import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
          <Search className="h-10 w-10 text-primary-800" />
        </div>
        <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page not found</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved to another section of the portal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all shadow-md active:scale-95"
        >
          <Home className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
