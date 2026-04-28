import { defineConfig } from 'drizzle-kit';
import getConfig from './config.server.js';

const appConfig = getConfig();

export default defineConfig({
  out: './drizzle',
  schema: './app/.server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: appConfig.postgresHost
    ? {
        host: appConfig.postgresHost,
        user: appConfig.postgresUser,
        password: appConfig.postgresPassword,
        port: appConfig.postgresPort,
        ssl: appConfig.postgresUseSsl,
        database: appConfig.postgresDatabase,
      }
    : {},
});
