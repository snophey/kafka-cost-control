import type { Route } from '../../routes/auth/+types/oauth-login';
import { authenticator } from '~/.server/auth/AuthenticatorProvider';

export async function action({ request }: Route.ActionArgs) {
  await authenticator.authenticate('oauth2-provider', request);
}

export async function loader({ request }: Route.LoaderArgs) {
  await authenticator.authenticate('oauth2-provider', request);
}
