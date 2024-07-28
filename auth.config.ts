import GoogleProvider from 'next-auth/providers/google';
import { NextAuthConfig } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJsonData() {
  const res = await fetch(`${API_URL}/api/read-json`);
  if (!res.ok) {
    throw new Error('Failed to fetch JSON data');
  }
  const data = await res.json();
  return data;
}

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
      // session.user'in tanımlı olup olmadığını kontrol edin
      if (!session.user) {
        session.user = { id: '', email: '', name: '', image: '' }; // Gerekli alanları içeren yeni bir nesne oluşturun
      }
      session.user.id = token.id as string;
      session.user.email = token.email as string;

      // Kara listede olan kullanıcıları kontrol edin ve oturumu geçersiz kılın
      const { blacklist } = await fetchJsonData();
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
