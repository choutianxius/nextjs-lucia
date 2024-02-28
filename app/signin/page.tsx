import { validateRequest } from '@/auth';
import { redirect } from 'next/navigation';
import SignInForm from '@/app/signin/signin-form';

export default async function Page() {
  /**
   * Session validation logic cannot happen in client side.
   * A simple walkaround is to extract client components
   * in their own files.
   */
  const { user, session } = await validateRequest();
  if (user) {
    redirect('/me');
  }
  return (
    <main>
      <SignInForm />
    </main>
  );
}
