import { auth } from '@/auth'
import { signIn } from 'next-auth/react'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      <button onClick={() => signIn('google')}>
        Google ile Giriş Yap
      </button>
    </main>
  )
}
