import React from "react";
import { 
  School, Users, ShieldCheck, CheckCircle2, AlertCircle, Calendar, 
  CreditCard, BookOpen, GraduationCap, ArrowRight, MonitorSmartphone,
  ClipboardList, Bell, UserPlus, Settings
} from "lucide-react";

export const metadata = {
  title: "EduCore - Official User Manual",
};

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0 text-slate-800 font-sans">
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-[20mm] print:p-0">
        
        {/* COVER PAGE */}
        <div className="h-[257mm] flex flex-col justify-center items-center text-center border-8 border-primary-900 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50 to-white -z-10" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
          
          <div className="bg-primary-900 text-white p-6 rounded-2xl mb-8 shadow-xl">
            <School className="w-24 h-24" />
          </div>
          <h1 className="text-6xl font-extrabold text-primary-950 tracking-tight mb-6">
            EduCore
          </h1>
          <h2 className="text-3xl font-semibold text-primary-700 mb-8">
            The Complete School Management Guide
          </h2>
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            A professional manual for Administrators, Teachers, Bursars, Parents, and Students.
          </p>
          
          <div className="mt-24 text-slate-400 font-medium tracking-widest uppercase">
            Official Documentation • 2026 Edition
          </div>
        </div>

        {/* PAGE BREAK */}
        <div className="break-before-page pt-12"></div>

        {/* INTRODUCTION */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-6 flex items-center gap-4 border-b pb-4">
            <MonitorSmartphone className="w-10 h-10 text-primary-600" />
            1. Welcome to EduCore
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 mb-6">
            EduCore is a next-generation school management system designed to eliminate paperwork, streamline communication, and provide real-time insights into your school's academic and financial health. Built specifically for the modern educational landscape, it supports the NaCCA Standards-Based Curriculum and ensures complete data security.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-50 p-6 rounded-xl border">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-600">Bank-level security ensures your school's data is never mixed with others.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border">
              <MonitorSmartphone className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-lg mb-2">Mobile First</h3>
              <p className="text-sm text-slate-600">Access dashboards on any device. Teachers can mark attendance straight from their phones.</p>
            </div>
          </div>
        </section>

        {/* SYSTEM SETUP */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-6 flex items-center gap-4 border-b pb-4">
            <Settings className="w-10 h-10 text-primary-600" />
            2. First-Time Setup (Admin)
          </h2>
          <p className="text-lg text-slate-700 mb-8">
            Setting up your school for the first time is a linear process. Follow these steps in order to ensure a smooth launch.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Configure the Academic Calendar</h3>
                <p className="text-slate-600">Go to <strong>Settings</strong>. Create the current Academic Year and define the start/end dates for Term 1, 2, and 3.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Create Classes & Subjects</h3>
                <p className="text-slate-600">Navigate to <strong>Classes</strong> to set up your structure (e.g., Basic 1, JHS 3). Then add your subjects (Math, Science) in the <strong>Subjects</strong> module.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Invite Staff Accounts</h3>
                <p className="text-slate-600">Use the <strong>Supabase Auth Invite</strong> system to send secure login links to your Teachers and Bursars. Assign their roles and link them to their respective classes.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">4</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Onboard Students (Bulk Import)</h3>
                <p className="text-slate-600">Go to <strong>Students {'>'} Import CSV</strong>. Download the template, copy your existing school roster into it, and upload. The system will instantly generate Admission Numbers and enroll hundreds of students at once.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE BREAK */}
        <div className="break-before-page pt-12"></div>

        {/* USER ROLES */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-8 flex items-center gap-4 border-b pb-4">
            <Users className="w-10 h-10 text-primary-600" />
            3. Dashboard Workflows by Role
          </h2>

          {/* ADMIN */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-primary-900 text-white p-6 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Headmaster / Admin</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Complete oversight, compliance, and strategic intervention.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"/><span><strong>Morning:</strong> Review the <em>Today at a Glance</em> cards. Check for red alerts indicating missing teachers or chronic student absences.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"/><span><strong>Midday:</strong> Monitor real-time fee collections versus outstanding balances on the financial charts.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"/><span><strong>Year-End:</strong> Run the automated Promotion Engine to process NaCCA-compliant graduation and class upgrades.</span></li>
              </ul>
            </div>
          </div>

          {/* CLASS TEACHER */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-blue-800 text-white p-6 flex items-center gap-4">
              <ClipboardList className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Class Teacher</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Pastoral care and daily student management.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"/><span><strong>Morning Routine:</strong> Tap the massive "Mark Attendance" button. Logging an absence automatically flags the student on the parent's portal.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"/><span><strong>Communication:</strong> Use the <em>Quick Announcement</em> box to send instant 160-character messages directly to the parents of their class.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"/><span><strong>Monitoring:</strong> View the color-coded student roster (Green/Amber/Red) to instantly identify struggling learners.</span></li>
              </ul>
            </div>
          </div>

          {/* SUBJECT TEACHER */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-indigo-800 text-white p-6 flex items-center gap-4">
              <BookOpen className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Subject Teacher</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Assessment and academic evaluation.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0"/><span><strong>Workflow:</strong> Create Assessments (Homework, Quizzes, Mid-terms) for assigned classes.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0"/><span><strong>Grading:</strong> Enter scores rapidly using the spreadsheet-style input interface. The system automatically calculates proficiency levels.</span></li>
              </ul>
            </div>
          </div>

          {/* BURSAR */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-amber-700 text-white p-6 flex items-center gap-4">
              <CreditCard className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Bursar</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Maximize liquidity and track revenue accurately.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/><span><strong>Collection:</strong> Use the massive top search bar to instantly find a student by ID.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/><span><strong>Recording:</strong> Record Cash or Mobile Money transactions. The system automatically reduces the outstanding balance and generates a digital receipt.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/><span><strong>Enforcement:</strong> Sort the <em>Defaulters List</em> by highest debt and trigger bulk payment reminders with one click.</span></li>
              </ul>
            </div>
          </div>

        </section>

        {/* PAGE BREAK */}
        <div className="break-before-page pt-12"></div>

        <section className="mb-16">
          {/* PARENT */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-teal-700 text-white p-6 flex items-center gap-4">
              <UserPlus className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Parent / Guardian</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Real-time peace of mind regarding child's safety and progress.</p>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                <h4 className="font-bold flex items-center gap-2 mb-2"><MonitorSmartphone className="w-4 h-4"/> Self-Registration (Method 5)</h4>
                <p className="text-sm text-slate-600">Parents do not need admins to create their accounts. They simply visit <code className="bg-slate-200 px-1 rounded text-primary-700">/register/parent</code>, enter their child's Admission Number and Name, and the system instantly grants them access.</p>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0"/><span><strong>Zero-Friction UX:</strong> The dashboard is entirely read-only with large touch targets.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0"/><span><strong>Safety:</strong> View a 5-day visual tracker of the child's physical attendance.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0"/><span><strong>Finance:</strong> See outstanding fee balances instantly in red, or a green "Fully Paid" badge.</span></li>
              </ul>
            </div>
          </div>

          {/* STUDENT / ALUMNI */}
          <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-violet-700 text-white p-6 flex items-center gap-4">
              <GraduationCap className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Student & Alumni</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4"><strong>Primary Goal:</strong> Academic focus and historical record access.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-violet-600 mt-0.5 shrink-0"/><span><strong>Active Students:</strong> Check the dashboard for impending homework deadlines (highlighted in red if overdue) and view the next day's timetable to pack bags correctly.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-violet-600 mt-0.5 shrink-0"/><span><strong>Graduated (Alumni):</strong> Once promoted to "Graduated" status by the Admin, the student loses access to active classes but retains a permanent, read-only portal to download past Terminal Report Cards and Certificates.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* PRINT INSTRUCTIONS */}
        <div className="mt-12 p-8 bg-slate-900 text-white rounded-2xl print:hidden flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              Ready for Distribution
            </h3>
            <p className="text-slate-300">Press <kbd className="bg-slate-800 px-2 py-1 rounded text-sm">Ctrl + P</kbd> (or <kbd className="bg-slate-800 px-2 py-1 rounded text-sm">Cmd + P</kbd>) to save this manual as a beautiful PDF.</p>
          </div>
          <button 
            onClick={() => window.print()} 
            className="px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Save as PDF
          </button>
        </div>

      </div>
    </div>
  );
}
