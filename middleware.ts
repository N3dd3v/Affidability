import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "@/lib/supabase/config";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf|eot)$/.test(
      pathname,
    )
  );
}

function isProtectedRoute(pathname: string): boolean {
  return !PUBLIC_ROUTES.has(pathname) && !isStaticAsset(pathname);
}

export async function middleware(request: NextRequest) {
  if (!hasSupabaseEnv) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request,
  });

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  let user = null;

  try {
    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser();

    user = nextUser;
  } catch {
    user = null;
  }

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
