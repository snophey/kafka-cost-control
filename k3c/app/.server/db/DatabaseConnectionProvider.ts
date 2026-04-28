import getConfig from 'config.server';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleDuckDb } from '@duckdbfan/drizzle-duckdb';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { migrate as migrateDuckDb } from '@duckdbfan/drizzle-duckdb';
import { DuckDBInstance } from '@duckdb/node-api';
import logger from '~/.server/logger/LoggerServiceProvider';

const config = getConfig();

const useDuckDb = !config.postgresHost;

logger.info(`Using ${useDuckDb ? 'DuckDB' : 'PostgreSQL'} database`);

const connection = useDuckDb
  ? await (await DuckDBInstance.create(config.duckDbPath)).connect()
  : null;

// You can specify any property from the node-postgres connection options
export const db = useDuckDb
  ? drizzleDuckDb(connection!)
  : drizzlePg({
      connection: {
        host: config.postgresHost,
        user: config.postgresUser,
        password: config.postgresPassword,
        port: config.postgresPort,
        ssl: config.postgresUseSsl,
        database: config.postgresDatabase,
      },
    });

logger.info('Performing database migrations (if any)...');
try {
  if (useDuckDb) {
    await migrateDuckDb(db as ReturnType<typeof drizzleDuckDb>, {
      migrationsFolder: 'drizzle/',
      migrationsTable: 'drizzle_migrations',
    });
  } else {
    await migratePg(db as ReturnType<typeof drizzlePg>, {
      migrationsFolder: 'drizzle/',
      migrationsTable: 'drizzle_migrations',
    });
  }
} catch (error) {
  logger.error('Error performing database migrations:', error);
  process.exit(1);
}
logger.info('Database migrations completed.');

if (useDuckDb && connection) {
  const shutdown = async () => {
    logger.info('Closing DuckDB connection...');
    try {
      connection.closeSync();
      logger.info('DuckDB connection closed');
    } catch (error) {
      logger.error('Error closing DuckDB connection:', error);
    }
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
