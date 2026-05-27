import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, updateUser } from "./db";

declare module "next-auth" {
  interface User {
    role?: string;
    clientCompany?: string;
    candidateId?: string;
    mustChangePassword?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      clientCompany?: string;
      candidateId?: string;
      mustChangePassword?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    clientCompany?: string;
    candidateId?: string;
    mustChangePassword?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        if (user.disabled) return null;
        const mustChange = user.mustChangePassword ?? false;
        // Clear invite-pending flag in DB immediately on login so admin sees "Active"
        // We still pass mustChange=true in the token so the UI redirects to change-password
        if (mustChange) {
          updateUser(user.id, { mustChangePassword: false }).catch((err) =>
            console.error("[auth] clearMustChangePassword:", err)
          );
        }
        return { id: user.id, name: user.name, email: user.email, role: user.role, clientCompany: user.clientCompany, candidateId: user.candidateId, mustChangePassword: mustChange };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clientCompany = user.clientCompany;
        token.candidateId = user.candidateId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.clientCompany = token.clientCompany as string | undefined;
        session.user.candidateId = token.candidateId as string | undefined;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026",
};
