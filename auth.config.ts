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

      // Google ile giriş yapıldıysa, `allowedEmails.json` ve `sessionBlacklist.json` kontrollerini yapın
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
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;

      // Kara listede olan kullanıcıları kontrol edin ve oturumu geçersiz kılın
      const { blacklist } = await fetchJsonData();
      if (blacklist.includes(token.email)) {
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
