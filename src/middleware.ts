export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/data-center/:path*",
    "/employee/:path*",
    "/items/:path*",
    "/master-data/:path*",
    "/service-records/:path*",
    "/profile/:path*",
  ],
};
