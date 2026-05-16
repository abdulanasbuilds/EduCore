import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function DemoBanner() {
  if (process.env.DEMO_MODE !== "true") {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-sm text-amber-900 font-medium z-50 sticky top-0">
      <AlertCircle className="h-4 w-4" />
      <span>
        🎯 DEMO MODE — This is sample data. No real students or payments. Data resets every Monday.
      </span>
      <Link href="/demo" className="underline ml-1 hover:text-amber-700">
        Get this for your school →
      </Link>
    </div>
  );
}
