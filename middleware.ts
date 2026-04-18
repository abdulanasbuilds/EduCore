import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, redirect to setup page
  // This handles fresh deployments where env vars not yet added
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    // Allow the setup page itself to load
    if (request.nextUrl.pathname === "/setup") {
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
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
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
    { pattern: /^\/admin/, roles: ["SCHOOL_ADMIN", "SUPER_ADMIN"] },
    { pattern: /^\/teacher/, roles: ["CLASS_TEACHER", "SUBJECT_TEACHER"] },
    { pattern: /^\/subject-teacher/, roles: ["SUBJECT_TEACHER", "CLASS_TEACHER"] },
    { pattern: /^\/bursar/, roles: ["BURSAR"] },
    { pattern: /^\/parent/, roles: ["PARENT"] },
    { pattern: /^\/student/, roles: ["STUDENT"] },
    { pattern: /^\/super-admin/, roles: ["SUPER_ADMIN"] },
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
      SUPER_ADMIN: "/super-admin",
      SCHOOL_ADMIN: "/admin",
      CLASS_TEACHER: "/teacher",
      SUBJECT_TEACHER: "/subject-teacher",
      BURSAR: "/bursar",
      PARENT: "/parent",
      STUDENT: "/student",
    }

    const destination = (profile as any)?.role 
      ? roleRedirects[(profile as any).role] ?? "/"
      : "/"

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

    if (matchedRoute && (profile as any)?.role && 
        !matchedRoute.roles.includes((profile as any).role)) {
      // Role doesn't match — redirect to their correct dashboard
      const roleRedirects: Record<string, string> = {
        SUPER_ADMIN: "/super-admin",
        SCHOOL_ADMIN: "/admin",
        CLASS_TEACHER: "/teacher",
        SUBJECT_TEACHER: "/subject-teacher",
        BURSAR: "/bursar",
        PARENT: "/parent",
        STUDENT: "/student",
      }
      const destination = roleRedirects[(profile as any).role] ?? "/"
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
