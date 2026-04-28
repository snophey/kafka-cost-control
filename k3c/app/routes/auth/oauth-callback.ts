import type { Route } from '../../routes/auth/+types/oauth-callback';
import { authenticator } from '~/.server/auth/AuthenticatorProvider';
import { redirect } from 'react-router';
import { sessionStorage } from '~/.server/session/SessionStorageProvider';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticator.authenticate('oauth2-provider', request);
  let session = await sessionStorage.getSession(request.headers.get('cookie'));

  session.set('user', user);

  // Redirect to the home page after successful login
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}
