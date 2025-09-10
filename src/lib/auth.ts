import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
            password: credentials.password,
          },
        });

        if (!user) return null;

        // NextAuth expects an object with at least an id
        return {
          id: String(user.id),
          name: user.namaLengkap,
          email: user.email ?? undefined,
          role: user.role ?? undefined,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, persist essential fields
      if (user) {
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        return token as any;
      }
      // For existing sessions created before role was added, hydrate from DB
      if (!('role' in token) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, namaLengkap: true, role: true },
        });
        if (dbUser) {
          token.id = String(dbUser.id);
          token.name = dbUser.namaLengkap;
          (token as any).role = dbUser.role ?? null;
        }
      }
      return token as any;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as any;
        session.user.name = token.name as any;
        session.user.email = token.email as any;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
