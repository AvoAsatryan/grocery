import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Redirect to dashboard if user is logged in and trying to access the root
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If there's a token, the user is authenticated
        return token != null
      },
    },
  }
)

export const config = { 
  matcher: [
    "/dashboard/:path*", // Protect all dashboard routes
    "/" // Include root path for redirection
  ] 
}