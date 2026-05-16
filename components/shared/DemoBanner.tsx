import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  // Only render if DEMO_MODE is true in env
  if (process.env.DEMO_MODE !== 'true') return null;

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 sm:px-6 lg:px-8 text-center text-amber-900 shadow-sm w-full top-0 z-50 sticky text-sm font-medium">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span>
            <strong>🎯 DEMO MODE</strong> — This is sample data. No real students or payments. Data resets every Monday.
          </span>
        </div>
        <Link href="/demo" className="whitespace-nowrap font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">
          [Get this for your school &rarr;]
        </Link>
      </div>
    </div>
  );
}
