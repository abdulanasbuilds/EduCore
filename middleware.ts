import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If not configured yet, only allow setup and public pages
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
    const path = request.nextUrl.pathname
    const allowed = ["/", "/setup", "/login", 
                     "/forgot-password", "/reset-password",
                     "/api/health"]
    if (!allowed.some(p => path === p || path.startsWith("/_next") || 
                          path.startsWith("/public"))) {
      return NextResponse.redirect(new URL("/setup", request.url))
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  })

  // Always use getUser() not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

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
  const isAuthPage = /^\/(login|forgot-password|reset-password)/.test(path)

  if (isProtected && !user) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const roleMap: Record<string, string> = {
      SUPER_ADMIN: "/super-admin",
      SCHOOL_ADMIN: "/admin",
      CLASS_TEACHER: "/teacher",
      SUBJECT_TEACHER: "/subject-teacher",
      BURSAR: "/bursar",
      PARENT: "/parent",
      STUDENT: "/student",
    }

    const dest = (profile as any)?.role ? (roleMap[(profile as any).role] ?? "/") : "/"
    return NextResponse.redirect(new URL(dest, request.url))
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
      const roleMap: Record<string, string> = {
        SUPER_ADMIN: "/super-admin",
        SCHOOL_ADMIN: "/admin",
        CLASS_TEACHER: "/teacher",
        SUBJECT_TEACHER: "/subject-teacher",
        BURSAR: "/bursar",
        PARENT: "/parent",
        STUDENT: "/student",
      }
      const destination = roleMap[(profile as any).role] ?? "/"
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
