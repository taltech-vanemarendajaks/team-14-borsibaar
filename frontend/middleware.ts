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
  const hasOrg = !!user?.organization;

  const isLogin = pathname.startsWith("/worker/login");
  const isOnboarding = pathname.startsWith("/worker/onboarding");

  // 1. NOT LOGGED IN → only login allowed
  if (!user) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL("/worker/login", req.url));
  }

  // 2. LOGGED IN + HAS ORG → block login/onboarding
  if (hasOrg) {
    if (isLogin || isOnboarding) {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 3. LOGGED IN BUT NO ORG → ONLY onboarding allowed
  if (!hasOrg) {
    if (isOnboarding) return NextResponse.next();

    return NextResponse.redirect(new URL("/worker/onboarding", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/worker/:path*"],
};
