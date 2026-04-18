import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

interface RouteConfig {
  pathRegex: RegExp;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const roleRedirects: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin",
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
  "/api/",
];

const routeConfigs: RouteConfig[] = [
  { pathRegex: /^\/admin(\/|$)/, allowedRoles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
  { pathRegex: /^\/teacher(\/|$)/, allowedRoles: ["CLASS_TEACHER"] },
  { pathRegex: /^\/subject-teacher(\/|$)/, allowedRoles: ["SUBJECT_TEACHER"] },
  { pathRegex: /^\/bursar(\/|$)/, allowedRoles: ["BURSAR"] },
  { pathRegex: /^\/parent(\/|$)/, allowedRoles: ["PARENT"] },
  { pathRegex: /^\/student(\/|$)/, allowedRoles: ["STUDENT"] },
  { pathRegex: /^\/super-admin(\/|$)/, allowedRoles: ["SUPER_ADMIN"] },
];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => path.startsWith(route));
}

function getRouteConfig(path: string): RouteConfig | undefined {
  return routeConfigs.find((config) => config.pathRegex.test(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const routeConfig = getRouteConfig(pathname);

  if (routeConfig) {
    const userRole = profile.role as UserRole;
    const redirectTo = request.nextUrl.pathname;

    if (!routeConfig.allowedRoles.includes(userRole)) {
      const targetUrl = new URL(roleRedirects[userRole] || "/login", request.url);
      targetUrl.searchParams.set("redirect", redirectTo);
      return NextResponse.redirect(targetUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};