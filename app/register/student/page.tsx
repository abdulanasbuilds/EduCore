"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { schoolConfig } from "@/lib/env";
import { verifyStudentForRegistration } from "@/actions/registration-actions";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function StudentRegistrationPage() {
  const [supabase, setSupabase] = useState<any>(null);
  const [configError, setConfigError] = useState(false);
  const [step, setStep] = useState<"verify" | "register" | "success">("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Verify identity
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [foundStudent, setFoundStudent] = useState<any>(null);

  // Step 2: Create login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch {
      setConfigError(true);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");

    const result = await verifyStudentForRegistration(admissionNumber, { dob: dateOfBirth });

    if (!result.success || !result.student) {
      setError(result.message || "An error occurred");
      setLoading(false);
      return;
    }

    setFoundStudent(result.student);
    setStep("register");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !foundStudent) return;
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: foundStudent.full_name,
          role: "student",
          school_id: foundStudent.school_id,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);
  };

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-lg text-center max-w-sm">
          <p className="font-medium">System not configured.</p>
          <p className="text-sm mt-1">Please contact the school administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {schoolConfig.logoUrl ? (
            <img src={schoolConfig.logoUrl} alt={schoolConfig.name} className="h-14 w-14 rounded-full object-cover mx-auto mb-3 border-2 border-slate-200" />
          ) : (
            <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold">{schoolConfig.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{schoolConfig.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Student Registration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          {step === "verify" && (
            <>
              <h2 className="text-lg font-semibold mb-1 text-slate-800">Verify Your Identity</h2>
              <p className="text-sm text-slate-500 mb-5">
                Enter your admission number and date of birth to create your student portal login.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="admissionNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Admission Number
                  </label>
                  <input
                    id="admissionNumber"
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="e.g. 2024-001"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !supabase}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Verifying..." : "Verify Identity"}
                </button>
              </form>
            </>
          )}

          {step === "register" && foundStudent && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
                <p className="text-green-800 text-sm font-medium">Identity verified:</p>
                <p className="text-green-700 text-sm">{foundStudent.full_name} ({foundStudent.admission_number})</p>
              </div>

              <h2 className="text-lg font-semibold mb-1 text-slate-800">Create Your Login</h2>
              <p className="text-sm text-slate-500 mb-5">Set up your email and password to access the student portal.</p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Create Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    minLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !supabase}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Creating Login..." : "Create Login"}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Login Created!</h2>
              <p className="text-sm text-slate-600 mb-6">
                Your student portal login has been created. Check your email to verify your account, then sign in.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Already have an account? Sign In
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {schoolConfig.name} &mdash; All Rights Reserved
        </p>
      </div>
    </div>
  );
}


