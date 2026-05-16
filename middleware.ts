import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026",
});

export const config = {
  matcher: ["/outplacement/:path*"],
};
