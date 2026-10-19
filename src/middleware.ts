import { withAuth } from "next-auth/middleware";

/**
 * Protects /app/* and authenticated /api/* routes.
 * Unauthenticated requests are redirected to /login.
 *
 * Note: We use `withAuth` from next-auth/middleware instead of re-exporting
 * the default export, because Next.js 16 + Turbopack requires the middleware
 * file to *directly* export a function (re-exports break the function-shape
 * detection that the build uses).
 *
 * In Next.js 16, the `middleware.ts` convention is deprecated in favor of
 * `proxy.ts`, but `middleware.ts` still works (with a warning). We keep
 * `middleware.ts` for now to maintain compat with the broader ecosystem.
 */
export default withAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth handler — must be public for login flow)
     * - api/public (public form fetch + submit — must be public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg, logo.svg, robots.txt (metadata files)
     */
    "/app/:path*",
    "/api/forms/:path*",
    "/api/workspaces/:path*",
    "/api/submissions/:path*",
  ],
};
