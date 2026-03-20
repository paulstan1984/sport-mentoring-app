import { unsealData } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import type { SessionData } from "./lib/session";

const COOKIE_NAME = "sport-session";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico", "/public"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const sealed = request.cookies.get(COOKIE_NAME)?.value;

  if (!sealed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let session: SessionData;
  try {
    session = await unsealData<SessionData>(sealed, {
      password: process.env.SESSION_SECRET!,
    });
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/mentor") && session.role !== "MENTOR") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/player") && session.role !== "PLAYER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
