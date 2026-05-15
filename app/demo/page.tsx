"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { demoConfig } from '@/lib/env';

const roles = [
  {
    id: 1,
    icon: '🏫',
    title: 'Headmaster / School Admin',
    description: 'See the full school dashboard — student records, fee collections, attendance overview, reports, and announcements.',
    email: 'headmaster@greenfield.demo',
    password: 'demo1234',
    buttonColor: '#1e3a5f',
  },
  {
    id: 2,
    icon: '👩‍🏫',
    title: 'Class Teacher',
    description: 'Mark daily attendance for your class, enter grades, and track how your students are performing each term.',
    email: 'teacher@greenfield.demo',
    password: 'demo1234',
    buttonColor: '#0369a1',
  },
  {
    id: 3,
    icon: '💰',
    title: 'Bursar / Accounts',
    description: 'Record fee payments, see who has outstanding balances, generate receipts, and view the school\'s financial summary.',
    email: 'bursar@greenfield.demo',
    password: 'demo1234',
    buttonColor: '#15803d',
  },
  {
    id: 4,
    icon: '👨‍👩‍👧',
    title: 'Parent',
    description: 'See exactly what parents experience — child\'s grades, attendance, fee balance, report cards, and school announcements.',
    email: 'parent@greenfield.demo',
    password: 'demo1234',
    buttonColor: '#7e22ce',
  },
];

const steps = [
  { id: 1, icon: '🏫', title: 'Log in as Headmaster', description: 'See live stats — students, fees, attendance all in one screen' },
  { id: 2, icon: '👥', title: 'Browse the Student List', description: 'Search, filter, and click any student to see their full profile' },
  { id: 3, icon: '✅', title: 'Log in as Teacher → Mark Attendance', description: 'Tick students present or absent — parents get notified instantly' },
  { id: 4, icon: '📊', title: 'Enter Some Grades', description: 'See how scores calculate averages and class positions automatically' },
  { id: 5, icon: '💰', title: 'Log in as Bursar → Record a Payment', description: 'See how receipts generate and balances update in real time' },
  { id: 6, icon: '📄', title: 'Generate a Report Card PDF', description: 'One click creates a professional PDF for any student' },
  { id: 7, icon: '📱', title: 'Log in as Parent', description: 'See everything a parent can access from their phone' },
  { id: 8, icon: '📢', title: 'Send an Announcement', description: 'Message all parents or just one class with a single click' },
];

function RoleCard({ role }: { role: typeof roles[0] }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleCopy = async (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div className="text-5xl mb-4">{role.icon}</div>
      <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">{role.title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{role.description}</p>
      <div className="flex flex-col space-y-3 mt-auto">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
            Email: {role.email}
          </span>
          <button
            onClick={() => handleCopy(role.email, setEmailCopied)}
            className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            disabled={emailCopied}
          >
            {emailCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
            Password: {role.password}
          </span>
          <button
            onClick={() => handleCopy(role.password, setPasswordCopied)}
            className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            disabled={passwordCopied}
          >
            {passwordCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <a
          href={`/login?email=${role.email}`}
          className="w-full text-white py-2 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: role.buttonColor }}
        >
          Login as {role.title.split(' / ')[0]}
        </a>
      </div>
    </div>
  );
}

function TourStep({ step, index, checked, onToggle }: { step: typeof steps[0]; index: number; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start space-x-4 text-left">
      <div className="flex-shrink-0 mt-1 flex h-5 w-5 items-center justify-center bg-[#1e3a5f] text-white rounded-full text-xs font-bold">
        {step.id}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 text-[#1e3a5f] focus:ring-primary border-gray-300 rounded"
          />
          <div className="space-y-0.5">
            <h3 className="font-semibold text-[#1e3a5f]">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [checklist, setChecklist] = useState(Array(8).fill(false));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a5f] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="bg-[#16a34a] text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
            LIVE DEMO — Try Before You Buy
          </span>
          <h1 className="text-4xl font-bold mb-2">Greenfield Academy</h1>
          <p className="text-lg mb-6">School Management System — Demo</p>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm">
            ⚠️ This is a demo environment with sample data only. No real student information. Data resets every Monday.
          </div>
        </div>
      </header>

      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience the complete system</h2>
          <p className="text-gray-600 lg:w-2/3 mx-auto">
            Log in as any role below to explore exactly what headmasters, teachers, bursars, and parents will experience when your school goes digital.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">What to try in 10 minutes</h2>
          <p className="text-gray-600 lg:w-2/3 mx-auto mb-8">
            Follow this guide to see the most powerful features
          </p>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <TourStep
                key={step.id}
                step={step}
                index={index}
                checked={checklist[index]}
                onToggle={() => {
                  setChecklist((prev) => {
                    const newList = [...prev];
                    newList[index] = !checklist[index];
                    return newList;
                  });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1e3a5f] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get this for your school?</h2>
          <p className="text-gray-200 lg:w-2/3 mx-auto mb-8">
            I&apos;ll set it up with your school&apos;s name, logo, and your real student data in under 90 minutes.
          </p>
          <div className="flex flex-col md:flex-row md:justify-center gap-4 mb-8">
            <a
              href={`https://wa.me/${demoConfig.whatsapp}`}
              className="flex-1 bg-[#16a34a] text-white py-3 rounded-md hover:bg-[#16a34a]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              💬 WhatsApp Me Now
            </a>
            <a
              href={`mailto:${demoConfig.email}`}
              className="flex-1 border border-white hover:bg-white/10 py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              📧 Send an Email
            </a>
          </div>
          <div className="flex flex-col md:flex-row md:justify-center gap-6 text-gray-200 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✅</span>
              <span>One-time payment — no monthly fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔒</span>
              <span>Your school&apos;s private database</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚡</span>
              <span>Setup in under 90 minutes</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-8 text-center">
        <p className="text-gray-500 mb-4">
          Demo by <span className="font-semibold text-gray-700">Abdul Anas</span>
        </p>
        <p className="text-sm text-gray-400 mb-4">Connect with me on social media</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://twitter.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X (Twitter)
          </a>
          <a href="https://instagram.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Instagram
          </a>
          <a href="https://facebook.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a href="https://tiktok.com/@abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.73-.34-3.87-1.08-1.42-.94-2.38-2.52-2.53-4.21-.16-1.77.35-3.54 1.4-4.96.97-1.31 2.43-2.14 4.04-2.33.1-.01.2-.02.3-.02v4.03c-.43.05-.86.16-1.26.35-.65.31-1.14.85-1.35 1.52-.22.67-.18 1.41.12 2.05.3.64.84 1.13 1.48 1.37.74.28 1.58.24 2.29-.1.71-.34 1.24-.95 1.47-1.7.13-.43.19-.88.19-1.33V.02h.01z"/></svg>
            TikTok
          </a>
          <a href="https://youtube.com/@abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            YouTube
          </a>
          <a href="https://www.linkedin.com/in/abdul-anas-0161b3370" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <a href="https://github.com/abdulanasbuilds" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 2.4.81 1.95-.54 4.03-.54 5.98 0 1.395-1.132 2.4-1.132 2.4-1.132.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Abdul Anas. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
