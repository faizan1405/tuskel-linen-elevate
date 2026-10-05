import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin/session";

const ADMIN_PATHS = ["/admin", "/admin/products", "/admin/categories", "/admin/orders", "/admin/customers", "/admin/inquiries", "/admin/inventory", "/admin/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page at /admin through without auth check
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (!ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("tuskel.admin.auth");
  const authResult = await verifyAdminSessionToken(authCookie?.value);
  const isAuthed = authResult.valid;

  if (!isAuthed) {
    const url = new URL("/admin", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
