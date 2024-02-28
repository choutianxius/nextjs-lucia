'use client';
import { useFormState } from 'react-dom';
import { signUp as _signUp, type SignUpResult } from '@/app/_lib/actions';

export default async function Page() {
  const [state, signUp] = useFormState<SignUpResult, FormData>(_signUp, undefined);
  return (
    <>
      <h1>Create Account</h1>
      <div>{state?.error}</div>
      <form className='bg-white text-black' action={signUp}>
        <label htmlFor='username'>User Name</label>
        <input name='username' id='username' />
        <br />
        <label htmlFor='password'>Password</label>
        <input name='password' id='password' />
        <br />
        <button type='submit'>Sign Up</button>
      </form>
    </>
  );
}
