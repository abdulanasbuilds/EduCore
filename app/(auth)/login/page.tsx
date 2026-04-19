"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

const roleRedirects: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  SCHOOL_ADMIN: "/admin",
  CLASS_TEACHER: "/teacher",
  SUBJECT_TEACHER: "/subject-teacher",
  BURSAR: "/bursar",
  PARENT: "/parent",
  STUDENT: "/student",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase, setSupabase] = useState<any>(null);
  const [configError, setConfigError] = useState(false);
  
  const [email, setEmail] = useState("");
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
        const userRole = profile.role as UserRole;
        router.push(roleRedirects[userRole] || "/login");
      } else {
        router.push("/login");
      }
    }

    router.refresh();
  };

  if (configError) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-center text-sm">
        <p className="font-medium">System not configured.</p>
        <p className="text-sm mt-1">Please add your Supabase credentials to continue.</p>
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
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          placeholder="name@school.edu"
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
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold">EC</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">EduCore</h1>
          <p className="text-slate-500 mt-1 text-sm">School Management Portal</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold mb-5 text-slate-800">Sign in to continue</h2>

          <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400 text-sm">Loading...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-5 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}