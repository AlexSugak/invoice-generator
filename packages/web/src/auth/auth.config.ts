import GoogleProvider from 'next-auth/providers/google';
import { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const isLoggedIn = !!user;
      const isGoogle = account?.provider === 'google';

      if (isGoogle && isLoggedIn) {
        return true;
      }

      return false;
    },
  },
};
