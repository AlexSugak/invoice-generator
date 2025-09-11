'use server';
import { signIn } from './';

export async function SignIn() {
  return await signIn('google');
}
