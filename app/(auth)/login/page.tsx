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
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
        <p className="font-bold">System not configured.</p>
        <p className="text-sm mt-1">Contact your administrator.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-slate-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          placeholder="admin@school.edu"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !supabase}
        className="w-full bg-primary-800 text-white py-2.5 rounded-md font-bold hover:bg-primary-700 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In to Portal"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-800 text-white rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-black italic">E</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">EduCore</h1>
          <p className="text-slate-500 mt-2 font-medium">Institutional Management Suite</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Sign In</h2>

          <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400 font-medium">Preparing secure gateway...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 font-medium uppercase tracking-widest">
            &copy; 2024 EduCore System
        </p>
      </div>
    </div>
  );
}
