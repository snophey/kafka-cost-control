import {
  type RouteConfig,
  index,
  route,
  layout,
} from '@react-router/dev/routes';

export default [
  layout('routes/app-layout.tsx', [
    index('routes/home.tsx'),
    route('contexts', 'routes/contexts.tsx'),
    route('metrics', 'routes/metrics.tsx'),
    route('applications', 'routes/applications.tsx'),
  ]),
  route('/oauth/callback', 'routes/auth/oauth-callback.ts'),
  route('/oauth/login', 'routes/auth/oauth-login.ts'),
  route('/oauth/logout', 'routes/auth/oauth-logout.ts'),
];
