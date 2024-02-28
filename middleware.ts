import { type NextRequest, NextResponse } from 'next/server';
// import { validateRequest } from '@/auth';

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

export default async function middleware(request: NextRequest) {
  /**
   * If your auth database is remote,
   * the following logic may be invoked for authentication
   * Unfortunately, in this code base, the SQLite database
   * is used, which requires node:fs API and cannot be used
   * in edge runtime.
   */
  // if (request.nextUrl.pathname === '/me') {// private path
  //   const { user, session } = await validateRequest();
  //   if (!user) {
  //     return Response.redirect(new URL('/', request.nextUrl));
  //   }
  // }
  return NextResponse.next();
}
