import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Middleware runs server-side in Docker container, so it can use BACKEND_URL directly
// This avoids going through nginx and Next.js API routes
const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

async function fetchUser(req: NextRequest) {
  try {
    const res = await fetch(`${backendUrl}/api/account`, {
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/worker")) {
    return NextResponse.next();
  }

  const user = await fetchUser(req);

  // /worker/login redirects if authenticated
  if (pathname.startsWith("/worker/login")) {
    if (user) {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!user) {
    return NextResponse.redirect(new URL("/worker/login", req.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/worker/:path*"],
};
