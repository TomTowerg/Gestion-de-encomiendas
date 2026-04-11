import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any, // @auth/prisma-adapter v2 uses a bundled @auth/core; casting is the standard workaround for next-auth v4 compatibility
  providers: [
    // ── SSO: Google OAuth 2.0 (RS256 signed id_token) ────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // ── OTP: Email Magic Link (SHA-256 hashed verification token) ────────────
    // Token is generated with crypto.randomBytes(32), hashed with SHA-256,
    // stored in VerificationToken table, and sent as a one-time link via email.
    EmailProvider({
      server: process.env.EMAIL_SERVER || "",
      from: process.env.EMAIL_FROM || "noreply@loombox.cl",
      // Token expires in 10 minutes (600 seconds) for security
      maxAge: 60 * 10,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ account }) {
      // Allow sign in with Google SSO or Email OTP
      return account?.provider === "google" || account?.provider === "email";
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async session({ session, user }) {
      // Add user id and role to session (types from src/types/next-auth.d.ts)
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },

    async jwt({ token, user }) {
      // Add user id and role to JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
