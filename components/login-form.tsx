'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { IconSpinner } from './ui/icons';
import { getMessageFromCode, ResultCode } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Result {
  type: 'error' | 'success';
  resultCode: ResultCode;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('google', { redirect: false });
      if (result?.error) {
        setError("Giriş başarısız.");
        toast.error("Giriş başarısız.");
      } else {
        toast.success("Giriş başarılı!");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu.");
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col items-center gap-4 space-y-3">
      <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md md:w-96 dark:bg-zinc-950">
        <h1 className="mb-3 text-2xl font-bold">Please log in to continue.</h1>
        <button
          type="button"
          className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          disabled={loading}
          onClick={handleSignIn}
        >
          {loading ? <IconSpinner /> : "Google ile Giriş Yap"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <Link
        href="/signup"
        className="flex flex-row gap-1 text-sm text-zinc-400"
      >
        No account yet? <div className="font-semibold underline">Sign up</div>
      </Link>
    </form>
  );
}
