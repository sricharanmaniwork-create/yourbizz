export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/app/:path*",
    "/api/forms/:path*",
    "/api/workspaces/:path*",
    "/api/submissions/:path*",
  ],
};
