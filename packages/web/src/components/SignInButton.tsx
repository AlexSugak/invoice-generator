'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { SignIn } from '@/src/auth/auth-action';

export function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <button
          onClick={() => signOut()}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
          {session.user?.email}
        </span>
      </>
    );
  }

  return (
    <form
      id="ConnectBox"
      className=""
      action={() => {
        SignIn();
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Sign In
      </button>
    </form>
  );
}
