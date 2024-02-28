import { validateRequest } from '@/app/_lib/actions';
import { signOut } from '@/app/_lib/actions';

export default async function Page() {
  const { user, session } = await validateRequest();
  if (!user) {
    return (
      <main>
        <h1 className='text-3xl'>Unauthorized: in-route protection</h1>
      </main>
    );
  }

  return (
    <main>
      <h1 className='text-3xl'>Welcome! This is a private page.</h1>
      <form action={signOut}>
        <button type='submit'>Sign Out</button>
      </form>
    </main>
  );
}