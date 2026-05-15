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

      <footer className="bg-white py-6 text-center text-gray-500">
        <p>
          Demo by Abdul Anas ·{' '}
          <a href="https://twitter.com/abdulanasbuilds" className="underline hover:text-gray-700">
            @abdulanasbuilds
          </a>
        </p>
      </footer>
    </div>
  );
}
