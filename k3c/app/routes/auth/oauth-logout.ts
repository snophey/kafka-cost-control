import type { Route } from '../../routes/auth/+types/oauth-logout';
import { redirect } from 'react-router';
import { getConfig } from 'config.server';
import { sessionStorage } from '~/.server/session/SessionStorageProvider';

export async function loader({ request }: Route.LoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'));

  return redirect(getConfig().oauthEndSessionEndpoint, {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function action({ request }: Route.ActionArgs) {
  let session = await sessionStorage.getSession(request.headers.get('cookie'));

  return redirect(getConfig().oauthEndSessionEndpoint, {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
