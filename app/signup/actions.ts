'use server'

import { signIn } from '@/auth'

export async function signup() {
  await signIn('google', {
    redirect: false
  });
}
