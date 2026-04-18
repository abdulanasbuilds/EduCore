"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

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
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single() as any;

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

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="you@school.edu.gh"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-800 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800">EduCore</h1>
          <p className="text-muted-foreground mt-2">School Management System</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading login form...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-4 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
