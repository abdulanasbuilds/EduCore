import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
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

const publicRoutes = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/auth/signout",
];

interface RouteConfig {
  pathRegex: RegExp;
  allowedRoles: UserRole[];
}

const routeConfigs: RouteConfig[] = [
  { pathRegex: /^\/super-admin(\/|$)/, allowedRoles: ["SUPER_ADMIN"] },
  { pathRegex: /^\/admin(\/|$)/, allowedRoles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
  { pathRegex: /^\/teacher(\/|$)/, allowedRoles: ["CLASS_TEACHER"] },
  { pathRegex: /^\/subject-teacher(\/|$)/, allowedRoles: ["SUBJECT_TEACHER"] },
  { pathRegex: /^\/bursar(\/|$)/, allowedRoles: ["BURSAR"] },
  { pathRegex: /^\/parent(\/|$)/, allowedRoles: ["PARENT"] },
  { pathRegex: /^\/student(\/|$)/, allowedRoles: ["STUDENT"] },
];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => path.startsWith(route));
}

function isApiRoute(path: string): boolean {
  return path.startsWith("/api/");
}

function getRouteConfig(path: string): RouteConfig | undefined {
  return routeConfigs.find((config) => config.pathRegex.test(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Allow public routes and API routes
  if (isPublicRoute(pathname) || isApiRoute(pathname)) {
    // Still refresh session for public routes
    const response = NextResponse.next();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    await supabase.auth.getUser();
    return response;
  }

  // Create response to pass cookies
  const response = NextResponse.next();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Root path redirect
  if (pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      const userRole = profile.role as UserRole;
      return NextResponse.redirect(new URL(roleRedirects[userRole] || "/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role-based access
  const routeConfig = getRouteConfig(pathname);
  if (routeConfig) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = profile.role as UserRole;

    if (!routeConfig.allowedRoles.includes(userRole)) {
      const targetUrl = new URL(roleRedirects[userRole] || "/login", request.url);
      return NextResponse.redirect(targetUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
