import GoogleProvider from 'next-auth/providers/google';
import { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup');

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (account?.provider === 'google') {
        const res = await fetch('/api/fetch-json');
        const { allowedEmails, blacklist } = await res.json();

        if (!allowedEmails.includes(token.email as string)) {
          throw new Error('Bu e-posta adresi kayıt için izinli değil.');
        }

        if (blacklist.includes(token.email as string)) {
          throw new Error('Bu kullanıcı oturum açamaz.');
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = { id: '', email: '', name: '', image: '' };
      }
      session.user.id = token.id as string;
      session.user.email = token.email as string;

      const res = await fetch('/api/fetch-json');
      const { blacklist } = await res.json();
      if (blacklist.includes(token.email as string)) {
        session.user = { id: '', name: '', email: '', image: '' };
      }

      return session;
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
};
