import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, UserRole } from "@/types";

const roleRedirects: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  SCHOOL_ADMIN: "/admin",
  CLASS_TEACHER: "/teacher",
  SUBJECT_TEACHER: "/subject-teacher",
  BURSAR: "/bursar",
  PARENT: "/parent",
  STUDENT: "/student",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle missing environment variables gracefully
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if ((!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // If we are on /setup and have the keys, redirect to home
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url' && pathname === "/setup") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase client
  const supabase = createServerClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh session and get user
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Handle Auth logic
  const isLoginPage = pathname === "/login";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password");
  const isSetupPage = pathname === "/setup";
  const isLandingPage = pathname === "/";
  const isApiRoute = pathname.startsWith("/api");

  // Redirect to setup if missing keys (already handled above mostly, but for safety)
  if (!supabaseUrl && !isSetupPage) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // If logged in and visiting login, redirect to dashboard
  if (user && isLoginPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      const userRole = (profile as any).role as UserRole;
      return NextResponse.redirect(new URL(roleRedirects[userRole] || "/", request.url));
    }
  }

  // Protect dashboard routes
  const protectedRoutes = [
    { prefix: "/admin", roles: ["SCHOOL_ADMIN", "SUPER_ADMIN"] },
    { prefix: "/teacher", roles: ["CLASS_TEACHER", "SUBJECT_TEACHER"] },
    { prefix: "/subject-teacher", roles: ["SUBJECT_TEACHER"] },
    { prefix: "/bursar", roles: ["BURSAR"] },
    { prefix: "/parent", roles: ["PARENT"] },
    { prefix: "/student", roles: ["STUDENT"] },
    { prefix: "/super-admin", roles: ["SUPER_ADMIN"] },
  ];

  const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.prefix));

  if (matchedRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !matchedRoute.roles.includes((profile as any).role)) {
      // Unauthorized for this specific role
      const userRole = (profile as any)?.role as UserRole;
      return NextResponse.redirect(new URL(userRole ? (roleRedirects[userRole] || "/") : "/login", request.url));
    }
  }

  // Handle root redirect for logged in users
  if (isLandingPage && user) {
      const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      const userRole = (profile as any).role as UserRole;
      return NextResponse.redirect(new URL(roleRedirects[userRole] || "/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
