"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { schoolConfig } from "@/lib/env";
import { 
  Home, BookOpen, Calendar as CalendarIcon, Wallet, Bell, Download, ChevronDown, User, AlertTriangle, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function ParentDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, school_id, full_name, phone")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      const schoolId = profile.school_id;

      // Current Term
      const { data: currentTerm } = await supabase
        .from("terms")
        .select("id, name, fee_due_date")
        .eq("school_id", schoolId)
        .eq("status", "active")
        .single();

      // Get Children
      const { data: guardian } = await supabase.from("guardians").select("id").eq("user_id", profile.id).single();
      let children: any[] = [];
      
      if (guardian) {
        const { data: sg } = await supabase.from("student_guardians").select("student_id").eq("guardian_id", guardian.id);
        if (sg && sg.length > 0) {
          const sIds = sg.map(s => s.student_id);
          const { data: st } = await supabase
            .from("students")
            .select("id, full_name, admission_number, photo_url, status, student_class_history(class_id, classes(name))")
            .in("id", sIds)
            .eq("student_class_history.is_current", true);
          children = st || [];
        }
      }

      if (children.length === 0) {
        setData({ profile, children: [] });
        setLoading(false);
        return;
      }

      const activeChildId = selectedChildId || children[0].id;
      if (!selectedChildId) setSelectedChildId(activeChildId);
      
      const activeChild = children.find(c => c.id === activeChildId);
      const activeClassId = activeChild?.student_class_history?.[0]?.class_id;
      const activeClassName = activeChild?.student_class_history?.[0]?.classes?.name || "Unknown Class";

      // Attendance this week
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      const weekDates = [0,1,2,3,4].map(i => addDays(monday, i));
      
      let weekAtt: any[] = [];
      let termAttPercent = 100;
      let absenceWarning = null;

      if (currentTerm) {
        const { data: termAtt } = await supabase
          .from("attendance")
          .select("date, status")
          .eq("student_id", activeChildId)
          .eq("term_id", currentTerm.id);

        if (termAtt && termAtt.length > 0) {
          const present = termAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
          termAttPercent = Math.round((present / termAtt.length) * 100);
          
          weekAtt = weekDates.map(d => {
            const dStr = format(d, 'yyyy-MM-dd');
            const record = termAtt.find(a => a.date === dStr);
            if (record?.status === 'Absent') {
              absenceWarning = `⚠️ ${activeChild.full_name.split(' ')[0]} was absent on ${format(d, 'EEEE dd MMM')}`;
            }
            return { date: d, status: record?.status || 'None', isFuture: d > today };
          });
        } else {
          weekAtt = weekDates.map(d => ({ date: d, status: 'None', isFuture: d > today }));
        }
      }

      // Latest Results
      const { data: grades } = await supabase
        .from("grades")
        .select("score, assessments(title, max_score, date, subjects(name))")
        .eq("student_id", activeChildId)
        .eq("assessments.is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      const mappedGrades = grades?.filter(g => g.assessments).map(g => {
        const ass = g.assessments as any;
        const pct = (g.score / ass.max_score) * 100;
        const letter = pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
        return {
          subject: ass.subjects?.name,
          title: ass.title,
          score: `${g.score}/${ass.max_score}`,
          grade: letter
        };
      }) || [];

      // Fee Status
      let feeBalance = 0;
      let feeDueDate = currentTerm?.fee_due_date;
      if (currentTerm) {
        const { data: assignments } = await supabase.from("fee_assignments").select("id").eq("term_id", currentTerm.id);
        if (assignments && assignments.length > 0) {
          const { data: fees } = await supabase.from("student_fees").select("balance").eq("student_id", activeChildId).in("fee_assignment_id", assignments.map(a => a.id));
          if (fees) {
            feeBalance = fees.reduce((sum, f) => sum + f.balance, 0);
          }
        }
      }

      // Latest Announcement
      const { data: announcements } = await supabase
        .from("announcements")
        .select("title, body, created_at")
        .eq("school_id", schoolId)
        .or(`target.eq.all,and(target.eq.class,class_id.eq.${activeClassId})`)
        .order("created_at", { ascending: false })
        .limit(1);

      // Upcoming Events
      const { data: events } = await supabase
        .from("school_events")
        .select("title, event_date")
        .gte("event_date", format(today, 'yyyy-MM-dd'))
        .eq("school_id", schoolId)
        .order("event_date")
        .limit(2);

      setData({
        profile,
        children,
        activeChild: { ...activeChild, className: activeClassName },
        currentTerm,
        weekAtt,
        termAttPercent,
        absenceWarning,
        grades: mappedGrades,
        feeBalance,
        feeDueDate,
        announcement: announcements?.[0] || null,
        events: events || []
      });
      setLoading(false);
    }
    loadDashboard();
  }, [supabase, selectedChildId]);

  if (loading) return <div className="p-6 text-center text-slate-500">Loading...</div>;
  if (data?.children?.length === 0) return <div className="p-6 text-center font-bold text-amber-600 bg-amber-50 m-4 rounded-xl">No active children found linked to your account. Please contact the school.</div>;

  const { profile, children, activeChild, currentTerm, weekAtt, termAttPercent, absenceWarning, grades, feeBalance, feeDueDate, announcement, events } = data;

  const getAttColor = (status: string, isFuture: boolean) => {
    if (isFuture) return "bg-slate-200";
    if (status === 'Present') return "bg-green-500";
    if (status === 'Absent') return "bg-red-500";
    if (status === 'Late') return "bg-amber-500";
    return "bg-slate-300"; // None/Weekend
  };

  const daysToFee = feeDueDate ? Math.ceil((new Date(feeDueDate).getTime() - new Date().getTime()) / 86400000) : 0;

  return (
    <div className="bg-slate-100 min-h-screen pb-24 md:pb-12 text-slate-900 font-sans">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 border-b flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          {schoolConfig.logoUrl ? (
            <img src={schoolConfig.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-white font-bold">{schoolConfig.name.charAt(0)}</div>
          )}
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight">{schoolConfig.name}</h1>
            <p className="text-xs text-slate-500">{profile.full_name.split(' ')[0]}'s Portal</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* CHILD SELECTOR */}
        {children.length > 1 && (
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block pl-1">Viewing Child</label>
            <div className="relative">
              <select 
                value={activeChild.id} 
                onChange={e => setSelectedChildId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold py-3 pl-4 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              >
                {children.map((c:any) => <option key={c.id} value={c.id}>{c.full_name} ({c.student_class_history[0]?.classes?.name})</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}

        {/* CHILD HERO CARD */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-5">
            {activeChild.photo_url ? (
              <img src={activeChild.photo_url} alt={activeChild.full_name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 border-4 border-white/20 flex items-center justify-center shadow-lg text-3xl">
                👤
              </div>
            )}
            <div>
              <h2 className="text-2xl font-extrabold mb-1 drop-shadow-sm">{activeChild.full_name}</h2>
              <p className="text-primary-100 font-medium text-lg">{activeChild.className}</p>
              <p className="text-primary-200 text-sm mt-1 bg-black/20 inline-block px-2 py-0.5 rounded-md backdrop-blur-sm">ID: {activeChild.admission_number}</p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* ATTENDANCE WEEK */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-primary-600" /> Attendance This Week
          </h3>
          <div className="flex justify-between items-center mb-4 px-2">
            {weekAtt.map((day:any, i:number) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full shadow-inner flex items-center justify-center text-white ${getAttColor(day.status, day.isFuture)}`}>
                  {day.status === 'Present' && <CheckCircle2 className="h-6 w-6" />}
                  {day.status === 'Absent' && <AlertTriangle className="h-5 w-5" />}
                </div>
                <span className="text-xs font-bold text-slate-500">{format(day.date, 'E')}</span>
              </div>
            ))}
          </div>
          <p className="text-center font-bold text-slate-700">Term Attendance: {termAttPercent}%</p>
          
          {absenceWarning && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium flex gap-2 items-start">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p>{absenceWarning}</p>
                <p className="text-xs mt-1 opacity-80">Contact school: {schoolConfig.phone || 'Office'}</p>
              </div>
            </div>
          )}
        </div>

        {/* FEE STATUS */}
        {feeBalance === 0 ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-full shrink-0">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-800">Fees Fully Paid</h3>
              <p className="text-emerald-700 font-medium">Thank you! Nothing outstanding.</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-red-800 mb-1">Outstanding Balance</h3>
            <h2 className="text-4xl font-extrabold text-red-600 mb-4 tracking-tight">GHS {(feeBalance/100).toLocaleString('en-GH', {minimumFractionDigits:2})}</h2>
            {feeDueDate && (
              <div className="bg-white/60 p-3 rounded-lg mb-4">
                <p className="text-sm font-bold text-slate-700">Due Date: {format(new Date(feeDueDate), 'dd MMMM yyyy')}</p>
                <p className={`text-sm font-extrabold mt-1 ${daysToFee < 0 ? 'text-red-600' : daysToFee < 7 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {daysToFee < 0 ? `${Math.abs(daysToFee)} days overdue` : `${daysToFee} days remaining`}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform">Pay via Mobile Money</button>
            </div>
          </div>
        )}

        {/* LATEST RESULTS */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" /> Latest Results
            </h3>
            <Link href="/parent/grades" className="text-sm font-bold text-indigo-600">See all &rarr;</Link>
          </div>
          
          {grades.length === 0 ? (
            <p className="text-center text-slate-500 italic py-4">No grades posted yet this term.</p>
          ) : (
            <div className="space-y-3">
              {grades.map((g:any, idx:number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">{g.subject}</p>
                    <p className="text-xs text-slate-500">{g.title}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-600">{g.score}</span>
                    <span className={`text-lg font-extrabold w-8 text-center ${g.grade === 'A' ? 'text-emerald-600' : g.grade === 'F' ? 'text-red-600' : 'text-indigo-600'}`}>{g.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LATEST ANNOUNCEMENT */}
        {announcement && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-500" /> Latest News
            </h3>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <h4 className="font-bold text-slate-900 mb-1">{announcement.title}</h4>
              <p className="text-sm text-slate-700 line-clamp-2">{announcement.body}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">{format(new Date(announcement.created_at), 'dd MMM yyyy')}</p>
            </div>
          </div>
        )}

        {/* UPCOMING EVENTS */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-teal-600" /> Upcoming Events
          </h3>
          {events.length === 0 ? (
            <p className="text-center text-slate-500 italic py-2">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e:any, idx:number) => (
                <li key={idx} className="flex gap-4 items-center p-3 border rounded-xl border-slate-100 shadow-sm">
                  <div className="bg-teal-50 text-teal-700 font-bold p-2 rounded-lg text-center min-w-[60px]">
                    <span className="block text-sm leading-none mb-1">{format(new Date(e.event_date), 'MMM')}</span>
                    <span className="block text-xl leading-none">{format(new Date(e.event_date), 'dd')}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-lg leading-tight">{e.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* DOWNLOAD REPORT */}
        <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
          <Download className="h-5 w-5" /> Download Last Term Report
        </button>
      </div>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 pb-safe md:hidden z-50">
        <Link href="/parent" className="flex flex-col items-center p-2 text-primary-700">
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </Link>
        <Link href="/parent/grades" className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <BookOpen className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">Grades</span>
        </Link>
        <Link href="/parent/attendance" className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <CalendarIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">Attendance</span>
        </Link>
        <Link href="/parent/finance" className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <Wallet className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">Fees</span>
        </Link>
        <Link href="/parent/announcements" className="flex flex-col items-center p-2 text-slate-400 hover:text-slate-600">
          <Bell className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1">News</span>
        </Link>
      </div>
    </div>
  );
}
