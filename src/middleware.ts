import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const publicPaths = ["/login", "/register", "/landing", "/legal", "/cgv", "/privacy"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/import") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // Root path: show landing if not logged in, dashboard if logged in
  if (pathname === "/") {
    if (!token) {
      return NextResponse.rewrite(new URL("/landing", request.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next(); // logged in → dashboard
    } catch {
      const response = NextResponse.rewrite(new URL("/landing", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // All other paths: require auth
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
