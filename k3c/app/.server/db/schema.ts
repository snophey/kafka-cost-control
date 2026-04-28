import { uuid, pgTable, text, date, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const metricsTable = pgTable('metrics', {
  id: text('technical_name').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default(''),
});
