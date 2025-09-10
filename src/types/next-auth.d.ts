import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id?: string | number;
      role?: string | null;
    };
  }

  interface User {
    id: string | number;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | number;
    role?: string | null;
  }
}

