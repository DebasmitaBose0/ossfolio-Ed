import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const runtime = "edge";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GH_CLIENT_ID!,
      clientSecret: process.env.GH_CLIENT_SECRET!,
      authorization: {
        params: {
          // Read-only access to public profile and repos
          scope: "read:user user:email public_repo read:org",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
