import { createCookieSessionStorage } from 'react-router';
import { getConfig } from 'config.server';

const appConfig = getConfig();

// Create a session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [appConfig.sessionSecret],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 400, // = 400 days
  },
});
