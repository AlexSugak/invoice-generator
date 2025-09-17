import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
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

// Add a credentials provider for testing purposes
if (process.env.NODE_ENV === 'test') {
  authConfig.providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return { id: 'test-user', email: credentials.email as string };
        }
        return null;
      },
    }),
  );
}
