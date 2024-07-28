import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { authConfig } from './auth.config';
import { readAllowedEmails, readBlacklist } from './lib/jsonUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJsonData() {
  const res = await fetch(`${API_URL}/api/read-json`);
  if (!res.ok) {
    throw new Error('Failed to fetch JSON data');
  }
  const data = await res.json();
  return data;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.JWT_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      const { blacklist } = await fetchJsonData();

      if (blacklist.includes(token.email)) {
        session.user = { id: '', name: '', email: '', image: '' };
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (account?.provider === 'google') {
        const { allowedEmails, blacklist } = await fetchJsonData();

        if (!allowedEmails.includes(token.email)) {
          throw new Error('Bu e-posta adresi kayıt için izinli değil.');
        }

        if (blacklist.includes(token.email)) {
          throw new Error('Bu kullanıcı oturum açamaz.');
        }
      }

      return token;
    }
  },
  session: {
    strategy: 'jwt',
  }
});
