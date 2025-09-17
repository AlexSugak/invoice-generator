'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    await signIn('google', {
      redirect: true,
      email,
      redirectTo: '/',
    })
  };

  return (
    <form onSubmit={handleSignIn}>
      <label>
        Email:
        <input type="email" name="email" defaultValue="test@example.com" />
      </label>
      <button type="submit" name="Login In">Login In</button>
    </form>
  );
}
