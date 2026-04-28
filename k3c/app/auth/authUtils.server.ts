import { redirect } from 'react-router';
import type { User } from '~/.server/auth/AuthenticatorProvider';
import { sessionStorage } from '~/.server/session/SessionStorageProvider';

export async function getUserFromSession(
  request: Request,
): Promise<User | null> {
  const session = await sessionStorage.getSession(
    request.headers.get('cookie'),
  );
  const user = session.get('user');
  if (user != null) {
    return user as User;
  }
  return null;
}

export async function ensureUser(request: Request) {
  const user = await getUserFromSession(request);
  if (user == null) {
    throw redirect('/oauth/login');
  }
  return user;
}
