'use server'

import { signIn } from '@/auth'

export async function authenticate() {
  await signIn('google', {
    redirect: false
  });
}
