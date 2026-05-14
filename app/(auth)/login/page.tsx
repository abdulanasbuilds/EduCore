"use client";
export const dynamic = 'force-dynamic';

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { schoolConfig } from "@/lib/env";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase, setSupabase] = useState<any>(null);
  const [configError, setConfigError] = useState(false);

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (e) {
      console.error(e);
      setConfigError(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else if (profile) {
        const roleMap: Record<string, string> = {
          school_admin: "/admin",
          class_teacher: "/teacher",
          subject_teacher: "/subject-teacher",
          bursar: "/bursar",
          parent: "/parent",
          student: "/student",
        };
        const dest = roleMap[profile.role] ?? "/";
        router.push(dest);
      } else {
        setError("Account profile not found. Please contact the school office.");
        setLoading(false);
        return;
      }
    } else {
        setLoading(false);
    }
  };

  if (configError) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-center text-sm">
        <p className="font-medium">System not configured.</p>
        <p className="text-sm mt-1">Please contact the school administration.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email or Phone
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          placeholder="Enter your email or phone"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          placeholder="Enter your password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !supabase}
        className="w-full text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
        style={{ backgroundColor: schoolConfig.primaryColor }}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {schoolConfig.logoUrl ? (
            <img src={schoolConfig.logoUrl} alt={schoolConfig.name} className="h-20 w-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-sm" />
          ) : (
            <div 
              className="w-20 h-20 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-3xl font-bold"
              style={{ backgroundColor: schoolConfig.primaryColor }}
            >
              {schoolConfig.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{schoolConfig.name}</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Parent & Staff Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
          <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400 text-sm">Loading...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center border-b border-slate-100 pb-6">
            <Link
              href="/forgot-password"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">New here?</p>
            <div className="space-y-3">
              <Link
                href="/register/parent"
                className="block text-center text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 px-4 rounded-xl transition-all"
              >
                Register as Parent &rarr;
              </Link>
              <Link
                href="/apply"
                className="block text-center text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 px-4 rounded-xl transition-all"
              >
                Apply for Admission &rarr;
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          {schoolConfig.name} &mdash; All Rights Reserved
        </p>
      </div>
    </div>
  );
}
