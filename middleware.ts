import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const path = request.nextUrl.pathname

  // Static files and API routes — skip middleware entirely
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.includes(".") ||
    path.startsWith("/api/webhooks")
  ) {
    return NextResponse.next()
  }

  // Not configured yet — show setup page
  if (!supabaseUrl || !supabaseKey) {
    const publicPaths = ["/", "/setup", "/login", "/apply",
                         "/register", "/forgot-password", 
                         "/reset-password", "/api/health"]
    const isPublic = publicPaths.some(p => 
      path === p || path.startsWith(p)
    )
    if (!isPublic) {
      return NextResponse.redirect(new URL("/setup", request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Always use getUser() — never getSession() server-side
  const { data: { user } } = await supabase.auth.getUser()

  // Protected route patterns and allowed roles
  const protectedRoutes = [
    { pattern: /^\/admin/, roles: ["school_admin"] },
    { pattern: /^\/teacher/, roles: ["class_teacher", "subject_teacher"] },
    { pattern: /^\/bursar/, roles: ["bursar"] },
    { pattern: /^\/parent/, roles: ["parent"] },
    { pattern: /^\/student/, roles: ["student"] },
  ]

  const publicPaths = ["/", "/login", "/setup", "/apply",
                       "/register", "/forgot-password",
                       "/reset-password", "/api/health"]

  const isPublic = publicPaths.some(p => 
    path === p || path.startsWith(p)
  )
  const isAuthPage = /^\/(login|forgot-password|reset-password)/.test(path)
  const matchedRoute = protectedRoutes.find(r => r.pattern.test(path))
  const isProtected = !!matchedRoute

  // Not logged in, trying to access protected route
  if (isProtected && !user) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  // Logged in, trying to access login page → redirect to dashboard
  if (user && isAuthPage) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const roleMap: Record<string, string> = {
        school_admin: "/admin",
        class_teacher: "/teacher",
        subject_teacher: "/teacher",
        bursar: "/bursar",
        parent: "/parent",
        student: "/student",
      }

      const dest = profile?.role 
        ? (roleMap[profile.role] ?? "/") 
        : "/"
      return NextResponse.redirect(new URL(dest, request.url))
    } catch {
      return response
    }
  }

  // Logged in, check role matches the route they're accessing
  if (user && isProtected && matchedRoute) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role && !matchedRoute.roles.includes(profile.role)) {
        const roleMap: Record<string, string> = {
          school_admin: "/admin",
          class_teacher: "/teacher",
          subject_teacher: "/teacher",
          bursar: "/bursar",
          parent: "/parent",
          student: "/student",
        }
        const dest = roleMap[profile.role] ?? "/"
        return NextResponse.redirect(new URL(dest, request.url))
      }
    } catch {
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
