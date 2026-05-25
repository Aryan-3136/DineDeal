import { NextRequest, NextResponse } from "next/server";

function decodeBase64Url(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    return atob(normalized);
  } catch {
    return "";
  }
}

function extractTokenFromCookie(value?: string) {
  if (!value) return null;
  if (value.startsWith("base64-")) {
    try {
      const decoded = JSON.parse(decodeBase64Url(value.slice(7)));
      return decoded?.access_token || decoded?.[0] || null;
    } catch {
      return null;
    }
  }
  try {
    const decoded = JSON.parse(decodeURIComponent(value));
    return decoded?.access_token || decoded?.[0] || null;
  } catch {
    return value.length > 40 ? value : null;
  }
}

function hasSupabaseSessionToken(request: NextRequest) {
  const directToken = extractTokenFromCookie(request.cookies.get("sb-access-token")?.value);
  if (directToken) return true;

  return request.cookies.getAll().some((cookie) => {
    if (!cookie.name.startsWith("sb-") || !cookie.name.endsWith("auth-token")) return false;
    return Boolean(extractTokenFromCookie(cookie.value));
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Middleware stays lightweight: it only redirects when no Supabase session token is present.
  // API route handlers perform the authoritative Auth user and admin_users role checks.
  if (!hasSupabaseSessionToken(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
