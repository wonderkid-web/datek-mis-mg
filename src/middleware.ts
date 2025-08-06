export { default } from "next-auth/middleware";

export const config = {
  // Match all routes except for the ones that start with /auth, /api, etc.
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|login).*)"],
};
