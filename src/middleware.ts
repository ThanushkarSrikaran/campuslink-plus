import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token") ||
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  const isStudentDashboard = pathname.startsWith("/dashboard");
  const isMentorDashboard = pathname.startsWith("/mentor-dashboard");
  const isAdminPage = pathname.startsWith("/admin");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!isLoggedIn && (isStudentDashboard || isMentorDashboard || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mentor-dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};