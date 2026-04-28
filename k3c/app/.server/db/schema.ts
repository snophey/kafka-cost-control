import { pgTable, text } from 'drizzle-orm/pg-core';

export const metricsTable = pgTable('metrics', {
  id: text('technical_name').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default(''),
});
