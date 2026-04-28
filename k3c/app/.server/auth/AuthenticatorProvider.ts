import { Authenticator } from 'remix-auth';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import * as jose from 'jose';
import { getConfig } from 'config.server';
import { v5 as uuidv5 } from 'uuid';

export type User = {
  id: string;
  preferred_username: string;
  email: string;
};

export const authenticator = new Authenticator<User>();

const appConfig = getConfig();
const USER_ID_NAMESPACE = uuidv5('user-id-namespace', uuidv5.URL);

export function generateUserIdFromSub(sub: string): string {
  return uuidv5(sub, USER_ID_NAMESPACE);
}

const oauthParams = {
  clientId: appConfig.oauthClientId,
  clientSecret: appConfig.oauthClientSecret,
  authorizationEndpoint: appConfig.oauthAuthorizationEndpoint,
  tokenEndpoint: appConfig.oauthTokenEndpoint,
  redirectURI: appConfig.oauthRedirectURI,
  tokenRevocationEndpoint: appConfig.oauthTokenRevocationEndpoint,
  scopes: ['openid', 'profile', 'email'],
};

authenticator.use(
  new OAuth2Strategy<User>(oauthParams, async ({ tokens, request }) => {
    const claims = jose.decodeJwt(tokens.idToken());
    if (!claims.sub) {
      throw new Error('Missing sub claim in ID token');
    }
    return {
      id: generateUserIdFromSub(claims.sub),
      preferred_username: claims.preferred_username!,
      email: claims.email!,
    } as User;
  }),
  'oauth2-provider',
);
