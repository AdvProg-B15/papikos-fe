import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute =
    path.startsWith("/my-properties") ||
    path.startsWith("/my-rentals") ||
    path.startsWith("/owner-rentals") ||
    path.startsWith("/balance") ||
    path.startsWith("/transactions") ||
    path.startsWith("/chat") ||
    path.startsWith("/wishlist") ||
    path.startsWith("/notifications") ||
    path.startsWith("/admin");

  if (isProtectedRoute) {
    const token = await getToken({ req: request });

    // Check if the user is authenticated
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Check if the path is an admin route and the user is an admin
    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if the path is an owner route and the user is an owner
    if (
      (path.startsWith("/my-properties") ||
        path.startsWith("/owner-rentals")) &&
      token.role !== "OWNER"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if the path is a tenant route and the user is a tenant
    if (
      (path.startsWith("/my-rentals") || path.startsWith("/wishlist")) &&
      token.role !== "TENANT"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-properties/:path*",
    "/my-rentals/:path*",
    "/owner-rentals/:path*",
    "/balance/:path*",
    "/transactions/:path*",
    "/chat/:path*",
    "/wishlist/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
