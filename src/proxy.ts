import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // This response object will be mutated with updated auth cookies.
  // It must be passed through — never create a new NextResponse inside the
  // setAll callback or the cookies won't be forwarded to the browser.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Reflect updated cookies back onto the request (for downstream code)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // 2. Rebuild response so it carries the new Set-Cookie headers
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() (not getSession()) is the only way to reliably
  // confirm the session is still valid AND refresh the access token if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtectedAdmin = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')

  if (isProtectedAdmin && user?.app_metadata?.role !== 'admin') {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
