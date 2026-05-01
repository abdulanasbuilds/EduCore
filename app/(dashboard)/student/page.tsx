export const dynamic = 'force-dynamic';
export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Portal</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">Welcome to your student dashboard. Here you can view your grades, attendance, and assignments.</p>
      </div>
    </div>
  );
}

