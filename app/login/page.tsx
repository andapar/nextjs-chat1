'use client';

import { signIn, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getSession } from '@/auth'; // getSession fonksiyonunu import edin

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className="flex flex-col p-4">
      <button onClick={() => signIn('google')}>
        Google ile Giriş Yap
      </button>
    </main>
  );
}
