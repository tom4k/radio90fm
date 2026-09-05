import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default_super_secret_key_change_in_production_123"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("radio90_session")?.value;

  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // Protected Admin Dashboard Route
  if (pathname.startsWith("/dashboard")) {
    if (!isValidSession) {
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return redirectResponse;
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // Login Page Route (Redirect to dashboard if already logged in)
  if (pathname === "/login") {
    if (isValidSession) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Protected Admin APIs (/api/v1/admin/* except /api/v1/admin/auth/login)
  if (pathname.startsWith("/api/v1/admin/") && !pathname.startsWith("/api/v1/admin/auth/login")) {
    if (!isValidSession) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to access admin APIs.",
          },
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/dashboard/:path*", "/api/v1/admin/:path*"],
};
