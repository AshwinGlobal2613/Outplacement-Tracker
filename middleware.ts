export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/outplacement/:path*"],
};
