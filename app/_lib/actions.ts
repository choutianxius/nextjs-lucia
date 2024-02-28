'use server';
import db from '@/db';
import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
import { lucia } from '@/auth';
import { redirect } from 'next/navigation';
import { generateId } from 'lucia';
import { cache } from 'react';

import type { Session, User } from 'lucia';

export type ActionResult = {
  error: string;
} | undefined;

export const signUp = async (currState: ActionResult, formData: FormData): Promise<ActionResult> => {
  try {
    const username = formData.get('username');
    // sanity check for username
    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      return ({ error: 'Invalid username' });
    }
    const row = db
      .prepare('SELECT * FROM user WHERE username = ?')
      .get(username);
    if (row) {
      return ({ error: 'Username already in use' });
    }

    // sanity check for password
    const password = formData.get('password');
    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 255
    ) {
      return ({ error: 'Invalid password' });
    }

    const hashedPassword = await new Argon2id().hash(password);
    let userId = generateId(15);
    const userIdExists = db.prepare('SELECT * FROM user WHERE id = ?');
    while (userIdExists.get(userId)) {
      // duplicate userId
      userId = generateId(15);
    }

    db
      .prepare('INSERT INTO user (id, username, hashed_password) VALUES (?, ?, ?)')
      .run(userId, username, hashedPassword);
    
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    console.log('here');

  } catch (e) {
    console.error(e);
    return ({ error: `Unexpected error: ${String(e)}` });
  }
  // must put redirect outside try-catch
  // for it works by throwing errors under the hood
  // @see https://nextjs.org/docs/app/api-reference/functions/redirect
  redirect('/me');
}

export const validateRequest = cache(
	async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null
			};
		}

		const result = await lucia.validateSession(sessionId);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch {}
		return result;
	}
);

export const signOut = async (): Promise<ActionResult> => {
  const { session } = await validateRequest();
  if (!session) return ({ error: 'Unauthorized' });
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  redirect('/');
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
	const username = formData.get('username');
	if (
		typeof username !== 'string' ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return {
			error: 'Invalid username'
		};
	}
	const password = formData.get('password');
	if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
		return {
			error: 'Invalid password'
		};
	}

	const existingUser = db
		.prepare('SELECT * FROM user where username = ?')
    .get(username) as User;

	if (!existingUser) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is none-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
		// If usernames are public, you may outright tell the user that the username is invalid.
		return {
			error: 'Incorrect username or password',
		};
	}

	const validPassword = await new Argon2id().verify(existingUser.password, password);
	if (!validPassword) {
		return {
			error: 'Incorrect username or password',
		};
	}

	const session = await lucia.createSession(existingUser.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect('/');
}

