"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DemoPage = () => {
  const [checklist, setChecklist] = useState(Array(8).fill(false));
  const [copyFeedback, setCopyFeedback] = useState<Record<number, boolean>>({});
  const router = useRouter();

  const toggleChecklist = (index: number) => {
    setChecklist(prev => {
      const newList = [...prev];
      newList[index] = !newList[index];
      return newList;
    });
  };

  const copyToClipboard = async (text: string, type: 'email' | 'password', index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(prev => ({
        ...prev,
        [index]: true
      }));
      // Reset feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback(prev => {
          const newState = {...prev};
          delete newState[index];
          return newState;
        });
      }, 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      return false;
    }
  };

  const roles = [
    {
      id: 1,
      icon: '🏫',
      title: 'Headmaster / School Admin',
      description: 'See the full school dashboard — student records, fee collections, attendance overview, reports, and announcements.',
      email: 'headmaster@greenfield.demo',
      password: 'demo1234',
      buttonColor: 'bg-[#1e3a5f] text-white',
      buttonText: 'Login as Headmaster',
    },
    {
      id: 2,
      icon: '👩‍🏫',
      title: 'Class Teacher',
      description: 'Mark daily attendance for your class, enter grades, and track how your students are performing each term.',
      email: 'teacher@greenfield.demo',
      password: 'demo1234',
      buttonColor: 'bg-[#0369a1] text-white',
      buttonText: 'Login as Teacher',
    },
    {
      id: 3,
      icon: '💰',
      title: 'Bursar / Accounts',
      description: 'Record fee payments, see who has outstanding balances, generate receipts, and view the school\'s financial summary.',
      email: 'bursar@greenfield.demo',
      password: 'demo1234',
      buttonColor: 'bg-[#15803d] text-white',
      buttonText: 'Login as Bursar',
    },
    {
      id: 4,
      icon: '👨‍👩‍👧',
      title: 'Parent',
      description: 'See exactly what parents experience — child\'s grades, attendance, fee balance, report cards, and school announcements.',
      email: 'parent@greenfield.demo',
      password: 'demo1234',
      buttonColor: 'bg-[#7e22ce] text-white',
      buttonText: 'Login as Parent',
    },
  ];

  const steps = [
    {
      id: 1,
      icon: '🏫',
      title: 'Log in as Headmaster',
      description: 'See live stats — students, fees, attendance all in one screen',
    },
    {
      id: 2,
      icon: '👥',
      title: 'Browse the Student List',
      description: 'Search, filter, and click any student to see their full profile',
    },
    {
      id: 3,
      icon: '✅',
      title: 'Log in as Teacher → Mark Attendance',
      description: 'Tick students present or absent — parents get notified instantly',
    },
    {
      id: 4,
      icon: '📊',
      title: 'Enter Some Grades',
      description: 'See how scores calculate averages and class positions automatically',
    },
    {
      id: 5,
      icon: '💰',
      title: 'Log in as Bursar → Record a Payment',
      description: 'See how receipts generate and balances update in real time',
    },
    {
      id: 6,
      icon: '📄',
      title: 'Generate a Report Card PDF',
      description: 'One click creates a professional PDF for any student',
    },
    {
      id: 7,
      icon: '📱',
      title: 'Log in as Parent',
      description: 'See everything a parent can access from their phone',
    },
    {
      id: 8,
      icon: '📢',
      title: 'Send an Announcement',
      description: 'Message all parents or just one class with a single click',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Section 1: Top Header */}
      <header className="bg-[#1e3a5f] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="bg-[#16a34a] text-white px-3 py-1 rounded-full text-xs font-medium">
            LIVE DEMO — Try Before You Buy
          </span>
          <h1 className="mt-4 text-3xl font-bold">Greenfield Academy</h1>
          <p className="mt-2 text-lg font-light">School Management System — Demo</p>
          <div className="mt-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
            ⚠️ This is a demo environment with sample data only. No real student information. Data resets every Monday.
          </div>
        </div>
      </header>

      {/* Section 2: Intro */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Experience the complete system</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Log in as any role below to explore exactly what headmasters, teachers, bursars, and parents will experience when your school goes digital.
          </p>
        </div>
      </section>

      {/* Section 3: Role Cards */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-5xl">{role.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{role.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{role.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 flex items-center">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{role.email}</code>
                      <button
                        onClick={() => copyToClipboard(role.email, 'email', role.id)}
                        className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300 transition"
                      >
                        {copyFeedback[role.id] ? 'Copied!' : 'Copy'}
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">Password:</span>
                    <span className="ml-2 flex items-center">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{role.password}</code>
                      <button
                        onClick={() => copyToClipboard(role.password, 'password', role.id)}
                        className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300 transition"
                      >
                        {copyFeedback[role.id] ? 'Copied!' : 'Copy'}
                      </button>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      router.push(`/login?email=${role.email}`);
                    }}
                    className={`${role.buttonColor} w-full py-2 px-4 rounded-md font-medium hover:bg-[#1e3a5f]/90 transition`}
                  >
                    {role.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Guided Tour */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">What to try in 10 minutes</h2>
          <p className="text-gray-600 mb-8 text-center max-w-xl mx-auto">
            Follow this guide to see the most powerful features
          </p>
          <ol className="space-y-6">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-[#1e3a5f] text-white rounded-full text-sm font-medium mt-0.5">
                  {step.id}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`step-${step.id}`}
                      checked={checklist[step.id - 1]}
                      onChange={() => toggleChecklist(step.id - 1)}
                      className="h-4 w-4 text-[#1e3a5f] focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 5: CTA */}
      <section className="bg-[#1e3a5f] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get this for your school?</h2>
           <p className="text-gray-200 mb-8 max-w-xl mx-auto">
             I&#39;ll set it up with your school&#39;s name, logo, and your real student data in under 90 minutes.
           </p>
          <div className="flex flex-col gap-4 md:flex-row md:justify-center">
            <a
              href="https://wa.me/233XXXXXXXXX"
              className="flex items-center justify-center px-6 py-3 bg-[#16a34a] text-white rounded-md font-medium hover:bg-[#15803d] transition"
            >
              💬 WhatsApp Me Now
            </a>
            <a
              href="mailto:your@email.com"
              className="flex items-center justify-center px-6 py-3 border border-white text-white rounded-md font-medium hover:bg-white/10 transition"
            >
              📧 Send an Email
            </a>
          </div>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-center text-gray-200">
             <div className="flex items-center space-x-2">
               <span className="text-2xl">✅</span>
               <span>One-time payment — no monthly fees</span>
             </div>
             <div className="flex items-center space-x-2">
               <span className="text-2xl">🔒</span>
               <span>Your school&#39;s private database</span>
             </div>
             <div className="flex items-center space-x-2">
               <span className="text-2xl">⚡</span>
               <span>Setup in under 90 minutes</span>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          Demo by Abdul Anas &middot; <a href="https://twitter.com/abdulanasbuilds" className="text-gray-600 hover:underline">@abdulanasbuilds</a>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;