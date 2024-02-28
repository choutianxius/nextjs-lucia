'use client';
import { useFormState } from 'react-dom';
import type { ActionResult } from '@/app/_lib/actions';
import { signIn as _signIn } from '@/app/_lib/actions';

export default function SignInForm() {
  const [state, signIn] = useFormState(_signIn, undefined);
  return (
    <form className='flex flex-col w-32' action={signIn}>
      <label className='mb-1' htmlFor='username'>Username</label>
      <input className='mb-2 text-black' id='username' name='username' />

      <label className='mb-1' htmlFor='password'>Password</label>
      <input className='mb-2 text-black' id='password' name='password' />

      {state && <div className='text-rose-500'>{state.error}</div>}

      <button type='submit'>Sign In</button>
    </form>
  );
}
