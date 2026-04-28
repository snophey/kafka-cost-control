import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: [process.env.ENV_FILE || '.env.local'] });

// Constants
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const configSchema = z.object({
  sessionSecret: z.string(),
  logLevel: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
  // Application roles configuration
  oauthClientId: z.string().min(1),
  oauthClientSecret: z.string().min(1),
  oauthAuthorizationEndpoint: z.url(),
  oauthTokenEndpoint: z.url(),
  oauthRedirectURI: z.url(),
  oauthTokenRevocationEndpoint: z.url(),
  oauthEndSessionEndpoint: z.url(),
  oauthScopes: z.array(z.string()).min(1),
  costControlUrl: z.string().url(),
  costControlBasicAuthUser: z.string().min(1),
  costControlBasicAuthPassword: z.string().min(1),
  postgresHost: z.string().optional(),
  postgresPort: z.coerce.number().optional(),
  postgresUseSsl: z.boolean().default(false),
  postgresUser: z.string().optional(),
  postgresPassword: z.string().optional(),
  postgresDatabase: z.string().optional(),
  duckDbPath: z.string().default('/tmp/k3c.db'),
});

/**
 * @typedef {z.infer<typeof configSchema>} AppConfigType
 */

/** @type {AppConfigType | null} */
let cachedConfig = null;

/**
 * Constructs the raw config object from the provided env bag.
 * @param {NodeJS.ProcessEnv} env
 * @returns {AppConfigType}
 */
function parseConfig(env) {
  const rawConfig = {
    sessionSecret: env.SESSION_SECRET,
    logLevel: env.LOG_LEVEL,
    // OAuth2 stuff
    oauthClientId: env.OIDC_CLIENT_ID,
    oauthClientSecret: env.OIDC_CLIENT_SECRET,
    oauthAuthorizationEndpoint: env.OIDC_AUTHORIZATION_ENDPOINT,
    oauthTokenEndpoint: env.OIDC_TOKEN_ENDPOINT,
    oauthRedirectURI: env.OIDC_REDIRECT_URI,
    oauthTokenRevocationEndpoint: env.OIDC_TOKEN_REVOCATION_ENDPOINT,
    oauthEndSessionEndpoint: env.OIDC_END_SESSION_ENDPOINT,
    oauthScopes: ['openid', 'profile', 'email'],
    costControlUrl: env.COST_CONTROL_URL,
    costControlBasicAuthUser: env.COST_CONTROL_BASIC_AUTH_USER,
    costControlBasicAuthPassword: env.COST_CONTROL_BASIC_AUTH_PASSWORD,
    postgresHost: env.POSTGRES_HOST,
    postgresPort: env.POSTGRES_PORT,
    postgresUseSsl: env.POSTGRES_USE_SSL === 'true',
    postgresUser: env.POSTGRES_USER,
    postgresPassword: env.POSTGRES_PASSWORD,
    postgresDatabase: env.POSTGRES_DATABASE,
    duckDbPath: env.DUCKDB_PATH,
  };

  return configSchema.parse(rawConfig);
}

/**
 * Writes a censored version of the config to the console for visibility.
 * @param {AppConfigType} validatedConfig
 */
function logCensoredConfig(validatedConfig) {
  const censoredConfig = {
    ...validatedConfig,
    sessionSecret: '[REDACTED]',
    oauthClientSecret: '[REDACTED]',
    costControlBasicAuthPassword: '[REDACTED]',
    postgresPassword: '[REDACTED]',
  };

  console.log(
    'Configuration loaded successfully:',
    JSON.stringify(censoredConfig, null, 2),
  );
}

/**
 * Loads and validates the application configuration from the provided env.
 * @param {{ reload?: boolean; env?: NodeJS.ProcessEnv }} options
 * @returns {AppConfigType}
 */
export function getConfig(options = {}) {
  const { reload = false, env = process.env } = options;
  if (cachedConfig !== null && !reload) {
    return cachedConfig;
  }

  try {
    const validatedConfig = parseConfig(env);
    cachedConfig = validatedConfig;
    logCensoredConfig(validatedConfig);
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.issues.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(
        'An unexpected error occurred during configuration loading:',
        error,
      );
    }
    process.exit(1);
  }
}

// This is a placeholder that signifies no value being set (for cases where we want to allow mandatory values to be missing in tests)
export const DUMMY_VALUE = 'YOUR_VALUE_HERE';
export default getConfig;
