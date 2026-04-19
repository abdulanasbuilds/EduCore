import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, redirect to setup page
  // This handles fresh deployments where env vars not yet added
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Allow the setup page itself to load
    if (request.nextUrl.pathname === "/setup") {
      return NextResponse.next()
    }
    // Allow auth pages (they show a "not configured" message)
    if (request.nextUrl.pathname.startsWith("/(auth)")) {
      return NextResponse.next()
    }
    // Redirect everything else to setup
    return NextResponse.redirect(new URL("/setup", request.url))
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach((cookie: any) =>
            request.cookies.set(cookie.name, cookie.value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach((cookie: any) =>
            supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always use getUser() not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Define protected routes and their required roles
  const protectedRoutes = [
    { pattern: /^\/admin/, roles: ["school_admin"] },
    { pattern: /^\/teacher/, roles: ["class_teacher", "subject_teacher"] },
    { pattern: /^\/subject-teacher/, roles: ["subject_teacher", "class_teacher"] },
    { pattern: /^\/bursar/, roles: ["bursar"] },
    { pattern: /^\/parent/, roles: ["parent"] },
    { pattern: /^\/student/, roles: ["student"] },
    { pattern: /^\/super-admin/, roles: ["super_admin"] },
  ]

  const isProtected = protectedRoutes.some(r => r.pattern.test(path))
  const isAuthPage = path.startsWith("/login") || 
                     path.startsWith("/forgot-password") ||
                     path.startsWith("/reset-password")

  // Not logged in, trying to access protected route
  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Logged in but trying to access login page
  if (user && isAuthPage) {
    // Get user role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const roleRedirects: Record<string, string> = {
      super_admin: "/super-admin",
      school_admin: "/admin",
      class_teacher: "/teacher",
      subject_teacher: "/subject-teacher",
      bursar: "/bursar",
      parent: "/parent",
      student: "/student",
    }

    const destination = profile?.role 
      ? roleRedirects[profile.role] ?? "/login"
      : "/login"

    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Logged in, check role matches the route
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const matchedRoute = protectedRoutes.find(r => r.pattern.test(path))

    if (matchedRoute && profile?.role && 
        !matchedRoute.roles.includes(profile.role)) {
      // Role doesn't match — redirect to their correct dashboard
      const roleRedirects: Record<string, string> = {
        super_admin: "/super-admin",
        school_admin: "/admin",
        class_teacher: "/teacher",
        subject_teacher: "/subject-teacher",
        bursar: "/bursar",
        parent: "/parent",
        student: "/student",
      }
      const destination = roleRedirects[profile.role] ?? "/login"
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)",
  ],
}
